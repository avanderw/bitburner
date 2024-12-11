import { isAlive } from "/daemon/util/isAlive";
import { init } from "/daemon/util/init";
import { StateMachine } from "/lib/StateMachine";
import { Thread } from "/type/CustomEnums";
import { NS } from "../bitburner/NetscriptDefinitions";
import { analyzeRequiredRuns, analyzeWeakenThreads } from "/util/analyze";
import { copyScripts } from "/util/copy";
import { debug, error, info, warn } from "../util/tail";
import { getMaxFreeRamHost } from "/util/host";

enum State {
    weakening = "weakening",
    growing = "growing"
}

export async function main(ns: NS) {
    const args = init(
        ns,
        [
            `Prepare a target for optimal hacking.`,
            "STATE weaken",
            "  WHERE threads min security on target",
            "  OR threads max memory on host",
            "  UNTIL min security reached",
            "SELECT grow AND weaken",
            "  WHERE threads max money on target",
            "  OR threads max memory on host",
            "  UNTIL max money reached"
        ],
        [{ option: "target", desc: "Target for the prep.", default: ns.getServer().hostname }]
    );

    if (!args.init) {
        return;
    }

    if (atMinSecurity(ns, args.target) && atMaxMoney(ns, args.target)) {
        ns.tail();
        warn(ns, `//${args.target}/ already prepared for hacking!`);
        return;
    }

    const strategy = new StateMachine(
        {
            states: {
                [State.weakening]: {
                    from: "",
                    enter: [() => info(ns, "Weakening...")],
                    action: weaken,
                    transition: { next: State.growing, stay: State.weakening }
                },
                [State.growing]: {
                    from: State.weakening,
                    enter: [() => info(ns, "Growing...")],
                    transition: { stay: State.growing },
                    action: grow
                }
            },
            initial: atMinSecurity(ns, args.target) ? State.growing : State.weakening
        },
        { ns: ns, target: args.target, args }
    );

    ns.disableLog("scp");
    while ((!atMinSecurity(ns, args.target) || !atMaxMoney(ns, args.target)) && isAlive(args)) {
        await copyScripts(ns, args);
        await strategy.do();
        await ns.sleep(args.sleep);
    }

    info(ns, `Finished preparing //${args.target}/`);
}

async function weaken(mem: { ns: NS; target: string; args: any }): Promise<string> {
    const ns = mem.ns;
    if (atMinSecurity(ns, mem.target)) {
        return "next";
    }

    const host = getMaxFreeRamHost(ns);
    const weakenAmount = ns.getServerSecurityLevel(mem.target) - ns.getServerMinSecurityLevel(mem.target);
    const weakenThreads = analyzeWeakenThreads(ns, host.cpuCores, weakenAmount);
    const weaken = analyzeRequiredRuns(ns, Thread.weaken, host, weakenThreads);
    weaken.time = Math.ceil(ns.getWeakenTime(mem.target));
    debug(ns, mem.args, "weaken = " + JSON.stringify(weaken, null, 2));

    if (weaken.threads < 1) {
        warn(ns, `Check memory on //${host.hostname}/ cannot weaken //${mem.target}/`);
        info(ns, "Skipping weaken this iteration.");
        await ns.sleep(mem.args.sleep);
    } else {
        const weakenPid = ns.exec(
            Thread.weaken,
            host.hostname,
            weaken.threads,
            "--target",
            mem.target,
            "(/daemon/prep)"
        );
        if (weakenPid === 0) {
            ns.tail();
            error(ns, `Enable debugging //${host.hostname}/ cannot weaken //${mem.target}/`);
            throw new Error("Not supported!");
        }
        await ns.sleep(weaken.time);
    }

    if (weaken.runs === 1) {
        return "next";
    } else {
        return "stay";
    }
}

async function grow(mem: { ns: NS; target: string; args: any }): Promise<string> {
    const ns = mem.ns;
    if (atMaxMoney(ns, mem.target)) {
        return "next";
    }

    const host = getMaxFreeRamHost(ns);
    const growRatio = ns.getServerMaxMoney(mem.target) / ns.getServerMoneyAvailable(mem.target);
    const growThreads = Math.ceil(ns.growthAnalyze(host.hostname, growRatio, host.cpuCores));
    const grow = analyzeRequiredRuns(ns, Thread.grow, host, growThreads, Math.ceil((host.maxRam - host.ramUsed) * 0.5));
    const growSecurity = ns.growthAnalyzeSecurity(grow.threads);
    const weakenThreads = analyzeWeakenThreads(ns, host.cpuCores, growSecurity);
    const weaken = analyzeRequiredRuns(
        ns,
        Thread.weaken,
        host,
        weakenThreads,
        Math.max(0, host.maxRam - host.ramUsed - grow.ram)
    );
    grow.time = Math.ceil(ns.getGrowTime(mem.target));
    weaken.time = Math.ceil(ns.getWeakenTime(mem.target));
    debug(ns, mem.args, "grow = " + JSON.stringify(grow, null, 2));
    debug(ns, mem.args, "weaken = " + JSON.stringify(weaken, null, 2));

    if (grow.runs < 1 || weaken.runs !== 1) {
        debug(ns, mem.args.debug, `{host=${host.hostname}, free=${host.maxRam - host.ramUsed}}`);
        warn(ns, `Check memory on //${host.hostname}/ cannot grow //${mem.target}/`);
        info(ns, "Skipping grow this iteration.");
        await ns.sleep(mem.args.sleep);
    } else {
        const growPid = ns.exec(Thread.grow, host.hostname, grow.threads, "--target", mem.target, "(/daemon/prep)");
        const weakenPid = ns.exec(
            Thread.weaken,
            host.hostname,
            weaken.threads,
            "--target",
            mem.target,
            "(/daemon/prep)"
        );
        if (growPid === 0 || weakenPid === 0) {
            ns.tail();
            error(ns, `Enable debugging //${host.hostname}/ cannot grow //${mem.target}/`);
            throw new Error("Not supported!");
        }
        await ns.sleep(weaken.time);
    }

    if (grow.runs === 1) {
        return "next";
    } else {
        return "stay";
    }
}

/**
 * Utility function to allow for easier reading.
 */
function atMaxMoney(ns: NS, s: string): boolean {
    return ns.getServerMoneyAvailable(s) === ns.getServerMaxMoney(s);
}

/**
 * Utility function to allow for easier reading.
 */
function atMinSecurity(ns: NS, s: string): boolean {
    return ns.getServerSecurityLevel(s) === ns.getServerMinSecurityLevel(s);
}
