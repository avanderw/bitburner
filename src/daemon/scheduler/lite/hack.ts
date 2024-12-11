import { NS } from "../../../bitburner/NetscriptDefinitions";
import { scan } from "/util/lite/scan";
import { init } from "/daemon/util/init";
import { Daemon } from "/type/CustomEnums";
import { debug, error, info, warn } from "../../../util/tail";
import { isAlive } from "/daemon/util";
import { copyScripts } from "/util/lite/copy";
import { getHackCluster } from "/util/lite/cluster";
import { ServerLite } from "../../../bitburner/CustomDefinitions";

export async function main(ns: NS) {
    const args = init(
        ns,
        [
            `Schedule '${Daemon.hack}'`,
            "SELECT target",
            "  ORDER BY money per second DESC"
        ],
        [{ option: "boot-delay", desc: "Time to allow for a script to consume RAM.", default: 1000 }]
    );

    ns.disableLog("scan");
    ns.disableLog("getServerMoneyAvailable")
    if (!args.init) {
        return;
    }

    if (args.sleep === 1000) {
        args.sleep = 300000;
    }

    ns.disableLog("scp");
    await copyScripts(ns, args);

    const allTargets: ServerLite[] = scan(ns)
        .filter(s => ns.getServerMaxMoney(s.hostname) !== 0)
        .filter(s => s.hostname !== "home");
    const hackingTargets: ServerLite[] = [...getHackCluster(ns, "pserver-"), "home"].flatMap(s =>
        ns
            .ps(s)
            .filter(p => p.filename === Daemon.hack)
            .map(p => p.args[p.args.findIndex(a => a === "--target") + 1])
            .map(a => {return {hostname:a, path:[]}})
    );
    const remainingTargets: ServerLite[] = allTargets.filter(s => !hackingTargets.find(p => p.hostname === s.hostname));

    info(ns, "Hacking targets:" + hackingTargets.map(s => `  //${s.hostname}/`).reduce((a, b) => `${a}\n${b}`, ""));
    info(ns, "Remaining targets:" + remainingTargets.map(s => `  //${s.hostname}/`).reduce((a, b) => `${a}\n${b}`, ""));

    while (remainingTargets.length > 0 && isAlive(args)) {
        const ready = remainingTargets
            .filter(s => ns.hasRootAccess(s.hostname))
            .filter(s => atMaxMoney(ns, s))
            .filter(s => atMinSecurity(ns, s))
            .sort((a, b) => analyzeMoneyPerSecond(ns, a) - analyzeMoneyPerSecond(ns, b))
            .reverse();

        for (let i = 0; i < ready.length; i++) {
            const target: ServerLite = ready[i];
            info(ns, `Hacking //${target.hostname}/`);

            if (args.dry) {
                debug(ns, args, `${Daemon.hack} --target ${target.hostname}`);
            } else {
                const pid = ns.run(Daemon.hack, 1, "--ratio", 0.75, "--target", target.hostname, args.debug ? "--debug" : "");
                if (pid === 0) {
                    ns.tail();
                    debug(ns, args, "Likely not enough RAM.");
                    debug(ns, args, "Not likely that process exists.");
                    warn(ns, `Not enough RAM to '${Daemon.hack} --target ${target.hostname}'`);
                }
            }

            remainingTargets.splice(remainingTargets.indexOf(target), 1);
            hackingTargets.push(target);

            await ns.sleep(args["boot-delay"]);
        }

        await ns.sleep(args.sleep);
    }
}

/**
 * Utility function to allow for easier reading.
 */
function atMaxMoney(ns:NS, s: ServerLite): boolean {
    return ns.getServerMaxMoney(s.hostname) === ns.getServerMoneyAvailable(s.hostname);
}

/**
 * Utility function to allow for easier reading.
 */
function atMinSecurity(ns:NS, s: ServerLite): boolean {
    return ns.getServerSecurityLevel(s.hostname) === ns.getServerMinSecurityLevel(s.hostname);
}

function analyzeMoneyPerSecond(ns: NS, server: ServerLite): number {
    return (
        (ns.hackAnalyzeChance(server.hostname) *
            ns.hackAnalyze(server.hostname) *
            ns.getServerMoneyAvailable(server.hostname)) /
        ns.getHackTime(server.hostname)
    );
}