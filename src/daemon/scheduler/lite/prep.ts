import { NS } from "../../../bitburner/NetscriptDefinitions";
import { scan } from "/util/lite/scan";
import { init } from "/daemon/util/init";
import { Daemon } from "/type/CustomEnums";
import { debug, info, warn } from "../../../util/tail";
import { isAlive } from "/daemon/util";
import { copyScripts } from "/util/lite/copy";
import { getHackCluster } from "/util/lite/cluster";
import { ServerLite } from "../../../bitburner/CustomDefinitions";

export async function main(ns: NS) {
    const args = init(
        ns,
        [
            `Schedule '${Daemon.prepLight}'`,
            "SELECT target",
            "  WHERE money != max-money",
            "  AND security != min-security",
            "  ORDER BY max-money DESC"
        ],
        [{ option: "boot-delay", desc: "Time to allow for a script to consume RAM.", default: 1000 }]
    );

    ns.disableLog("scan");
    if (!args.init) {
        return;
    }

    if (args.sleep === 1000) {
        args.sleep = 300000;
    }

    ns.disableLog("scp");
    await copyScripts(ns, args);
    ns.enableLog("scp");

    const allTargets: ServerLite[] = scan(ns)
        .filter(s => ns.getServerMaxMoney(s.hostname) !== 0)
        .filter(s => s.hostname !== "home");
    const preparedTargets: ServerLite[] = allTargets.filter(s => atMaxMoney(ns, s) && atMinSecurity(ns, s));
    const prepairingTargets: ServerLite[] = [...getHackCluster(ns, "pserver-"), "home"].flatMap(s =>
        ns
            .ps(s)
            .filter(p => p.filename === Daemon.prepLight)
            .map(p => p.args[p.args.findIndex(a => a === "--target") + 1])
            .map(a => {
                return { hostname: a, path: [] };
            })
    );
    const remainingTargets: ServerLite[] = allTargets
        .filter(s => !preparedTargets.find(p => p.hostname === s.hostname))
        .filter(s => !prepairingTargets.find(p => p.hostname === s.hostname))
        .filter(s => !atMaxMoney(ns, s) || !atMinSecurity(ns, s));

    info(ns, "Prepared targets:" + preparedTargets.map(s => `  //${s.hostname}/`).reduce((a, b) => `${a}\n${b}`, ""));
    info(
        ns,
        "Preparing targets:" + prepairingTargets.map(s => `  //${s.hostname}/`).reduce((a, b) => `${a}\n${b}`, "")
    );
    info(ns, "Remaining targets:" + remainingTargets.map(s => `  //${s.hostname}/`).reduce((a, b) => `${a}\n${b}`, ""));

    while (remainingTargets.length > 0 && isAlive(args)) {
        const ready = remainingTargets
            .filter(s => ns.hasRootAccess(s.hostname))
            .sort((a, b) => ns.getServerMaxMoney(a.hostname) - ns.getServerMaxMoney(b.hostname))
            .reverse();

        for (let i = 0; i < ready.length; i++) {
            const target: ServerLite = ready[i];

            info(ns, `Preparing //${target.hostname}/`);

            if (args.dry) {
                debug(ns, args, `${Daemon.prepLight} --target ${target.hostname}`);
            } else {
                const pid = ns.run(Daemon.prepLight, 1, "--target", target.hostname, args.debug ? "--debug" : "");
                if (pid === 0) {
                    ns.tail();
                    debug(ns, args, "Likely not enough RAM.");
                    debug(ns, args, "Not likely that process exists.");
                    warn(ns, `Not enough RAM to '${Daemon.prepLight} --target ${target.hostname}'`);
                } else {
                    remainingTargets.splice(remainingTargets.indexOf(target), 1);
                    prepairingTargets.push(target);
                }
            }
            await ns.sleep(args["boot-delay"]);
        }

        await ns.sleep(args.sleep);
    }
}

/**
 * Utility function to allow for easier reading.
 */
function atMaxMoney(ns: NS, s: ServerLite): boolean {
    return ns.getServerMoneyAvailable(s.hostname) === ns.getServerMaxMoney(s.hostname);
}

/**
 * Utility function to allow for easier reading.
 */
function atMinSecurity(ns: NS, s: ServerLite): boolean {
    return ns.getServerSecurityLevel(s.hostname) === ns.getServerMinSecurityLevel(s.hostname);
}
