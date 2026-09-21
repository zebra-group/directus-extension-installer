import { readFileSync } from "node:fs";
import path from "node:path";
import { RELEASE_ASSETS } from "../src/update";

const rootDir = path.join(__dirname, "..");

// Die Namen der Release-Assets entstehen aus der pkg-Konfiguration und werden
// vom Release-Workflow hochgeladen. Weicht der Self-Update-Code davon ab,
// findet er sein eigenes Release nicht und bricht mit
// "No asset found for platform" ab — genau das war bis zum Umzug der Fall.
describe('Release assets', () => {
    const workflow = readFileSync(path.join(rootDir, '.github/workflows/ci.yml'), 'utf-8');

    it('names assets that the release workflow actually uploads', () => {
        const missing = Object.values(RELEASE_ASSETS)
            .filter(asset => !workflow.includes(`compiled/${asset}`));

        expect(missing).toEqual([]);
    });

    it('derives asset names from the package name pkg builds with', () => {
        const packageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
        const wrongPrefix = Object.values(RELEASE_ASSETS)
            .filter(asset => !asset.startsWith(packageJson.name));

        expect(wrongPrefix).toEqual([]);
    });

    it('covers every platform the self-update supports', () => {
        expect(Object.keys(RELEASE_ASSETS).sort()).toEqual(['darwin', 'win32']);
    });
});
