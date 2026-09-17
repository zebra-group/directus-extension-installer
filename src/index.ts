#!/usr/bin/env node
import { execSync } from "node:child_process";
import { Dependency } from "./types";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers"
import { selfUpdate } from "./update";
import {
    readDependenciesFromFile,
    parseStringToDependencies,
    parseYamlToDependencies,
    getExtensionPath,
    parseBoolean, 
    createExtensionBasePaths
} from "./helpers";

const args = yargs(hideBin(process.argv))
    .help()
    .check((argv, options) => {
        if(argv._.length > 1) {
            console.error('Too many arguments were given! Please only provide one target path!')
            process.exit()
        }
        if(argv._.length < 1) {
            console.error('You need to provide a target path for the extension installation!')
            process.exit()
        }
        if(!argv.f && !argv.s && !argv.y) {
            console.error('You need to specify atleast one source check --help!')
            process.exit()
        }
        return true
    })
    .option('f', {
        alias: 'file',
        normalize: true,
        conflicts: ['s', 'y'],
        describe: 'Path to a json file with the required values!'
    })
    .option('s', {
        alias: 'string',
        string: true,
        conflicts: ['f', 'y'],
        describe: 'Stringyfied json values with the extension information.'
    })
    .option('y', {
        alias: 'yaml',
        normalize: true,
        conflicts: ['s', 'f'],
        describe: 'Path to yaml file with the required structure of the helm chart.'
    })
    .parseSync()

let dependencies: Array<Dependency> = [];

(async () => {
    // Checking for Updates and doing them.
    await selfUpdate()

    const extensionsInstallPath = path.resolve(path.normalize(args._[0].toString()))

    createExtensionBasePaths(extensionsInstallPath)

    if(args.f) {
        dependencies = readDependenciesFromFile(args.f)
    }

    if(args.s) {
        dependencies = parseStringToDependencies(args.s)
    }

    if(args.y) {
        dependencies = parseYamlToDependencies(args.y)
    }

    for (const dep of dependencies) {
        let finalPath = getExtensionPath(extensionsInstallPath, dep.type, dep.name)

        try {
            if(existsSync(finalPath)) {
                rmSync(finalPath, { recursive: true, force: true })
            } 
            if (dep.branch) {
                console.log(`Cloning ${dep.name} with branch ${dep.branch}...`)
                execSync(`git clone -b ${dep.branch} ${dep.git} ${finalPath}`)
            } else {
                console.log(`Cloning ${dep.name}...`)
                execSync(`git clone ${dep.git} ${finalPath}`)
            }
            console.log(`Extension ${dep.name} cloned!`)
        } catch (error) {
            console.error(error);
        }

        if (dep.npm_install) {
            console.log(`Installing npm dependencies for ${dep.name}...`)
            execSync(`npm install --prefix=${finalPath}`)
            console.log(`Npm dependencies for ${dep.name} installed!`)
        }

        if (dep.npm_build) {
            console.log(`Building ${dep.name}...`)
            execSync(`npm run build --prefix=${finalPath}`)
            console.log(`Built ${dep.name}!`)
        }
    }
    console.log('Done Installing!');
})()
