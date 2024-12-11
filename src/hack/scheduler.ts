import { scan } from "/hack/scan";
import { NS } from "/bitburner/NetscriptDefinitions";
import { configDaemon, runDaemon } from "/util/daemon";
import { Config, startupScript } from "/util/script";
import { warn } from "/log/in/api";

export async function main(ns: NS) {
    const config = configDaemon(ns, "Scheduler", "Start preparing and hacking servers.", []);
    startupScript(ns, config);
    await runDaemon(ns, config, daemon);
}

async function daemon(ns: NS, config: Config) {
    const toPrep = await findServersToPrep(ns, config);
    for (const target of toPrep) {
        const ps = ns.run("/hack/prepare.js", 1, `--target=${target}`);
        if (ps === 0) {
            warn(ns, config, "Could not start prepare.");
        }
    }

    const toHack = await findServersToHack(ns, config);
    for (const target of toHack) {
        const ps = ns.run("/hack/hack.js", 1, `--target=${target}`);
        if (ps === 0) {
            warn(ns, config, "Could not start hack.");
        }
    }
}

async function findServersToHack(ns: NS, config: Config): Promise<string[]> {
    const inProgress = [...getHackCluster(ns, "pserver-"), "home"].flatMap(s =>
        ns
            .ps(s)
            .filter(p => p.filename === "/hack/hack.js")
            .map(p => p.args[p.args.findIndex(a => a.startsWith("--target="))])
            .map(a => a.substring("--target=".length))
    );

    const todo = scan(ns)
        .filter(s => s.hostname !== "home")
        .filter(s => ns.getServerMaxMoney(s.hostname) !== 0)
        .filter(s => ns.hasRootAccess(s.hostname))
        .filter(s => ns.getServerMoneyAvailable(s.hostname) === ns.getServerMaxMoney(s.hostname))
        .filter(s => ns.getServerSecurityLevel(s.hostname) === ns.getServerMinSecurityLevel(s.hostname))
        .filter(s => !inProgress.find(p => p === s.hostname));

    return todo.map(s => s.hostname);
}

async function findServersToPrep(ns: NS, config: Config): Promise<string[]> {
    const done = scan(ns)
        .filter(s => ns.getServerMaxMoney(s.hostname) !== 0)
        .filter(s => s.hostname !== "home")
        .filter(s => atMaxMoney(ns, s.hostname) && atMinSecurity(ns, s.hostname));

    const inProgress = [...getHackCluster(ns, "pserver-"), "home"].flatMap(s =>
        ns
            .ps(s)
            .filter(p => p.filename === "/hack/prepare.js" || p.filename === "/hack/hack.js")
            .map(p => p.args[p.args.findIndex(a => a.startsWith("--target="))])
            .map(a => a.substring("--target=".length))
    );

    const todo = scan(ns)
        .filter(s => s.hostname !== "home")
        .filter(s => ns.getServerMaxMoney(s.hostname) !== 0)
        .filter(s => ns.hasRootAccess(s.hostname))
        .filter(s => !done.find(p => p.hostname === s.hostname))
        .filter(s => !inProgress.find(p => p === s.hostname));

    return todo.map(s => s.hostname);
}

export function getHackCluster(ns: NS, prefix: string): string[] {
    const hardcoded = [];
    for (let i = 0; i < 25; i++) {
        const hostname = prefix + i;
        if (ns.serverExists(hostname)) {
            hardcoded.push(hostname);
        }
    }
    return hardcoded;
}

function atMaxMoney(ns: NS, target: string): boolean {
    return ns.getServerMoneyAvailable(target) === ns.getServerMaxMoney(target);
}

function atMinSecurity(ns: NS, target: string): boolean {
    return ns.getServerSecurityLevel(target) === ns.getServerMinSecurityLevel(target);
}
