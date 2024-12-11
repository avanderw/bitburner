import { isAlive } from "/daemon/util/isAlive";
import { init } from "/daemon/util/init";
import { Thread } from "/type/CustomEnums";
import { NS, Server } from "../bitburner/NetscriptDefinitions";
import { analyzeRequiredRuns, analyzeWeakenThreads } from "/util/analyze";
import { copyScripts } from "/util/copy";
import { debug, error, info, warn } from "../util/tail";
import { getMaxFreeRamHost } from "/util/host";

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}

export async function main(ns: NS) {
    const args = init(
        ns,
        [`Maintain a stable hack on a target.`, "- Grow a server back to max.", "- Weaken a sever back to min."],
        [
            { option: "target", desc: "Target for the hack.", default: ns.getServer().hostname },
            { option: "ratio", desc: "Ratio of funds to hack of the available.", default: 0.5 }
        ]
    );

    if (!args.init) {
        return;
    }

    let target = ns.getServer(args.target);

    if (!atMinSecurity(target) || !atMaxMoney(target)) {
        ns.tail();
        warn(ns, `//${target.hostname}/ not prepared for hacking!`);
        return;
    }

    ns.disableLog("scp");
    while (isAlive(args)) {
        await copyScripts(ns, args);
        await hack(ns, target, args);

        target = ns.getServer(target.hostname);
        if (!atMaxMoney(target) || !atMinSecurity(target)) {
            ns.tail();
            error(ns, `Hack on //${target.hostname}/ not stable!`);
            debug(ns, args, JSON.stringify(target, null, 2));
            return;
        }
    }

    info(ns, `Finished hacking //${target.hostname}/`);
}

async function hack(ns: NS, target: Server, args: { ratio: number; debug: boolean, sleep:number }): Promise<void> {
    const host = getMaxFreeRamHost(ns);

    const singleHack = ns.hackAnalyze(target.hostname);
    const hackThreads = Math.floor(args.ratio / singleHack);
    const hackAction = analyzeRequiredRuns(
        ns,
        Thread.hack,
        host,
        hackThreads,
        Math.ceil((host.maxRam - host.ramUsed) * 0.5)
    );

    const hackAmount = Math.floor(target.moneyAvailable * hackThreads * singleHack);
    const moneyLeft = target.moneyAvailable - hackAmount;
    const growThreads = Math.ceil(
        ns.growthAnalyze(target.hostname, (target.moneyMax * 1.1) / moneyLeft, host.cpuCores) // overgrow to account for drift, might be hack lvl change
    );
    const growAction = analyzeRequiredRuns(
        ns,
        Thread.grow,
        host,
        growThreads,
        Math.ceil((host.maxRam - host.ramUsed) * 0.5)
    );

    const hackSecurity = ns.hackAnalyzeSecurity(hackAction.threads);
    const growSecurity = ns.growthAnalyzeSecurity(growAction.threads);
    const weakenAction = analyzeRequiredRuns(
        ns,
        Thread.weaken,
        host,
        analyzeWeakenThreads(ns, host.cpuCores, hackSecurity + growSecurity),
        Math.max(0, host.maxRam - host.ramUsed - hackAction.ram - growAction.ram)
    );

    hackAction.time = Math.ceil(ns.getHackTime(target.hostname));
    growAction.time = Math.ceil(ns.getGrowTime(target.hostname));
    weakenAction.time = Math.ceil(ns.getWeakenTime(target.hostname));

    debug(ns, args, `hackAction=${JSON.stringify(hackAction, null, 2)}`);
    debug(ns, args, `growAction=${JSON.stringify(growAction, null, 2)}`);
    debug(ns, args, `weakenAction=${JSON.stringify(weakenAction, null, 2)}`);

    if (hackAction.runs > 1) {
        warn(ns, `Multiple runs detected to hack //${target.hostname}/ by ${args.ratio * 100}%`);
    }

    if (growAction.runs !== 1 || weakenAction.runs !== 1 || hackAction.runs < 1) {
        warn(ns, `Hack will not stabalise //${target.hostname}/ (likely memory related)`);
        info(ns, "Skipping hack this iteration.")
        await ns.sleep(args.sleep);
    } else {
        const hId = ns.exec(Thread.hack, host.hostname, hackAction.threads, "--target", target.hostname, "(/daemon/hack)");
        const gId = ns.exec(Thread.grow, host.hostname, growAction.threads, "--target", target.hostname, "(/daemon/hack)");
        const wId = ns.exec(Thread.weaken, host.hostname, weakenAction.threads, "--target", target.hostname, "(/daemon/hack)");

        if (hId === 0 || gId === 0 || wId === 0) {
            ns.tail();
            error(ns, `Enable debugging //${host.hostname}/ cannot hack //${target.hostname}/`);
            throw new Error("Not supported!");
        }

        await ns.sleep(weakenAction.time + 100);

        while (ns.ps().find(p => p.pid === wId) !== undefined) {
            ns.tail();
            warn(ns, `Did not wait long enough for weaken when hacking //${target.hostname}/`);
            await ns.sleep(args.sleep);
        }
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
