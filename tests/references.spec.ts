import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const rootDir = path.join(__dirname, "..");

// Der alte GitLab-Host wurde mit der Umfirmierung abgeschaltet und loest nicht
// mehr auf (NXDOMAIN). Jede verbliebene Referenz ist damit ein toter Link.
const RETIRED_HOST = "git.mindbox.rocks";

// Die Alt-Organisation auf GitHub existiert noch, enthaelt aber nur noch die
// "moved"-Profilseite. API-Aufrufe funktionieren dort nur ueber GitHubs
// Transfer-Redirect — der bricht, sobald der alte Name neu vergeben wird.
const RETIRED_OWNER = "api.github.com/repos/mindbox/";

function filesIn(dir: string): string[] {
    return readdirSync(path.join(rootDir, dir), { recursive: true })
        .map(entry => path.join(dir, entry.toString()))
        .filter(file => statSync(path.join(rootDir, file)).isFile());
}

function filesContaining(needle: string, files: string[]): string[] {
    return files.filter(file => readFileSync(path.join(rootDir, file), "utf-8").includes(needle));
}

describe('External references', () => {
    // Die Spec-Dateien selbst muessen die Suchbegriffe enthalten, sonst koennten
    // sie nicht dagegen pruefen.
    const targets = ['README.md', ...filesIn('src'), ...filesIn('tests/assets')];

    it('points at no URL on the retired git.mindbox.rocks host', () => {
        expect(filesContaining(RETIRED_HOST, targets)).toEqual([]);
    });

    it('resolves self-updates through the current organisation, not a transfer redirect', () => {
        expect(filesContaining(RETIRED_OWNER, targets)).toEqual([]);
    });
});
