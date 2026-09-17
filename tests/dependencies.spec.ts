import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const rootDir = path.join(__dirname, "..");

function readJson(file: string) {
    return JSON.parse(readFileSync(path.join(rootDir, file), "utf-8"));
}

describe('Dependencies', () => {
    const packageJson = readJson('package.json');
    const packageLock = readJson('package-lock.json');

    it('requires no package from the retired @mbx scope', () => {
        const declared = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };
        const scoped = Object.keys(declared).filter(name => name.startsWith('@mbx/'));

        expect(scoped).toEqual([]);
    });

    it('resolves every locked package from a registry that still exists', () => {
        const entries: Record<string, { resolved?: string }> = packageLock.packages;
        const unreachable = Object.entries(entries)
            .filter(([, entry]) => entry.resolved?.includes('mindbox.rocks'))
            .map(([name]) => name);

        expect(unreachable).toEqual([]);
    });

    it('pins no scoped registry on a host that no longer resolves', () => {
        const npmrc = path.join(rootDir, '.npmrc');
        const contents = existsSync(npmrc) ? readFileSync(npmrc, 'utf-8') : '';

        expect(contents).not.toContain('mindbox.rocks');
    });
});
