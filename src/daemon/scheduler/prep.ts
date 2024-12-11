import { NS, Server } from "../../bitburner/NetscriptDefinitions";
import { scan } from "/util/scan";
import { init } from "/daemon/util/init";
import { Daemon } from "/type/CustomEnums";
import { debug, info, warn } from "../../util/tail";
import { isAlive } from "/daemon/util";
import { copyScripts } from "/util/copy";

export async function main(ns: NS) {
    const args = init(
        ns,
        [
            `Schedule '${Daemon.prep}'`,
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

    const allTargets: Server[] = scan(ns)
        .filter(s => !s.purchasedByPlayer)
        .filter(s => s.moneyMax !== 0)
        .filter(s => s.hostname !== "home");
    const preparedTargets: Server[] = allTargets.filter(s => atMaxMoney(s) && atMinSecurity(s));
    const prepairingTargets: Server[] = [...ns.getPurchasedServers(), "home"].flatMap(s =>
        ns
            .ps(s)
            .filter(p => p.filename === Daemon.prep)
            .map(p => p.args[p.args.findIndex(a => a === "--target") + 1])
            .map(a => ns.getServer(a))
    );
    const remainingTargets: Server[] = allTargets
        .filter(s => !preparedTargets.find(p => p.hostname === s.hostname))
        .filter(s => !prepairingTargets.find(p => p.hostname === s.hostname))
        .filter(s => !atMaxMoney(s) || !atMinSecurity(s));

    info(ns, "Prepared targets:" + preparedTargets.map(s => `  //${s.hostname}/`).reduce((a, b) => `${a}\n${b}`, ""));
    info(
        ns,
        "Preparing targets:" + prepairingTargets.map(s => `  //${s.hostname}/`).reduce((a, b) => `${a}\n${b}`, "")
    );
    info(ns, "Remaining targets:" + remainingTargets.map(s => `  //${s.hostname}/`).reduce((a, b) => `${a}\n${b}`, ""));

    while (remainingTargets.length > 0 && isAlive(args)) {
        remainingTargets.splice(0, remainingTargets.length, ...remainingTargets.map(s => ns.getServer(s.hostname)));
        const ready = remainingTargets
            .filter(s => s.hasAdminRights)
            .sort((a, b) => a.moneyMax - b.moneyMax)
            .reverse();

        for (let i = 0; i < ready.length; i++) {
            const target: Server = ready[i];

            info(ns, `Preparing //${target.hostname}/`);

            if (args.dry) {
                debug(ns, args, `${Daemon.prep} --target ${target.hostname}`);
            } else {
                const pid = ns.exec(Daemon.prep, "home", 1, "--target", target.hostname, args.debug ? "--debug" : "");
                if (pid === 0) {
                    ns.tail();
                    debug(ns, args, "Likely not enough RAM.");
                    debug(ns, args, "Not likely that process exists.");
                    warn(ns, `Not enough RAM to '${Daemon.prep} --target ${target.hostname}'`);
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
function atMaxMoney(s: Server): boolean {
    return s.moneyAvailable === s.moneyMax;
}

/**
 * Utility function to allow for easier reading.
 */
function atMinSecurity(s: Server): boolean {
    return s.hackDifficulty === s.minDifficulty;
}
