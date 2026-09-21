import semver from "semver";
import axios, { AxiosRequestConfig } from "axios";
import { writeFileSync } from "fs";
import path from "path";
import { execSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

// Getting current version from package.json
let currentVersion = require('../package.json').version;

// Keine Authentifizierung für öffentliche GitHub-Repos nötig
const headers = {
    'Accept': 'application/vnd.github.v3+json'
}

export async function selfUpdate() {
    console.log(`Current version: ${currentVersion}`)

    // Skip update entirely if in development mode
    if(process.env.NODE_ENV === "development") return
    
    // Checking if on linux so it return immediatly inside the container
    if(process.platform === "linux" && process.env.NODE_ENV !== 'test') return

    const latestReleaseTag = await _getLatestRealeaseTag()

    // Checking if newer version is available
    if (!semver.gt(latestReleaseTag, currentVersion)) return

    console.log(`Found newer Version. Updating to the latest version (${latestReleaseTag})...`);

    await _getLatestReleaseFile()

    // Exiting application and restarting it.
    console.log(`Successfully updated to ${latestReleaseTag}. Restarting now...`)

    process.on("exit", function () {
        const child = spawnSync(process.argv.shift()!, process.argv, {
            cwd: process.cwd(),
            stdio: "inherit",
        })
    });
    process.exit()
}

const GITHUB_OWNER = 'zebra-group';
const GITHUB_REPO = 'directus-extension-installer';

// Namen der Release-Assets, so wie pkg sie aus dem Paketnamen baut und der
// Release-Workflow (.github/workflows/ci.yml) sie hochlaedt. Weichen sie
// voneinander ab, findet der Self-Update sein eigenes Release nicht.
export const RELEASE_ASSETS = {
    darwin: 'directus-extension-installer-macos',
    win32: 'directus-extension-installer-win.exe'
} as const;

export async function _getLatestRealeaseTag() {
    // GitHub: https://api.github.com/repos/{owner}/{repo}/releases/latest
    const latestReleaseRequestOptions = {
        method: 'GET',
        url: `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
        headers
    }
    const latestReleaseData = (await axios(latestReleaseRequestOptions)).data
    return latestReleaseData.tag_name
}

export async function _getLatestReleaseFile() {
    // GitHub: Release-Asset-Download-URL muss dynamisch aus Release-API geholt werden
    const latestReleaseRequestOptions = {
        method: 'GET',
        url: `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
        headers
    }
    const latestReleaseData = (await axios(latestReleaseRequestOptions)).data

    // Asset je nach Plattform auswählen
    const assetName = RELEASE_ASSETS[process.platform as keyof typeof RELEASE_ASSETS]
    if (!assetName) throw new Error('Unsupported platform for self-update');

    const asset = latestReleaseData.assets.find((a: any) => a.name === assetName);
    if (!asset) throw new Error(`No asset found for platform: ${assetName}`);

    // Download-URL von GitHub ist in asset.browser_download_url
    let downloadLatestReleaseOptions: AxiosRequestConfig = {
        method: 'GET',
        url: asset.browser_download_url,
        responseType: 'arraybuffer'
    }

    const programName = path.basename(process.execPath)
    const tempDownload = path.resolve(tmpdir(), programName)
    let updateCopyCommand: string = ''
    switch (process.platform) {
        case 'darwin':
            updateCopyCommand = `cp ${tempDownload} ${process.execPath}`
            break;
        case 'win32':
            updateCopyCommand = `copy ${tempDownload} ${process.execPath}`
            break;
    }

    // Downloading the executable and saving it at a temporary location
    const download = (await axios(downloadLatestReleaseOptions)).data
    const fileData = Buffer.from(download, 'binary')
    writeFileSync(tempDownload, fileData)

    // Overwriting the old executable with the new one
    execSync(updateCopyCommand)
}
