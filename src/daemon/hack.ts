import { isAlive } from "/daemon/util/isAlive";
import { init } from "/daemon/util/init";
import { Thread } from "/type/CustomEnums";
import { NS } from "../bitburner/NetscriptDefinitions";
import { analyzeWeakenThreads } from "/util/analyze";
import { asciiTitle } from "../format/ascii-title";
import { box, form, progress } from "/util/format";
import { info, debug, error, warn, now } from "../util/tail";
import { check, Rule, ruleMaxMoney, ruleMinSecurity, ruleNotOwned } from "/util/rules";

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}

const float = new Intl.NumberFormat("en-us", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const integer = new Intl.NumberFormat("en-us", { maximumFractionDigits: 0, minimumFractionDigits: 0 });

export async function main(ns: NS) {
    const args = init(
        ns,
        ["Run a stable hack on a target.", "Batch hack-, weaken-, grow-, weaken- threads."],
        [
            { option: "target", desc: "Target for the hack.", default: ns.getHostname() },
            { option: "ratio", desc: "Ratio of funds to hack of the available.", default: 0.75 },
            { option: "delay", desc: "Timing schedule between threads.", default: 200 }
        ]
    );

    while (isAlive(args)) {
        ns.print(asciiTitle("batch-hack"));
        ns.print(
            form([
                { label: "Target", value: args.target },
                { label: "Security", value: ns.getServerSecurityLevel(args.target) + "µ" },
                { label: "Min-Security", value: ns.getServerMinSecurityLevel(args.target) + "µ" },
                { label: "Money", value: currency.format(ns.getServerMoneyAvailable(args.target)) },
                { label: "Max-Money", value: currency.format(ns.getServerMaxMoney(args.target)) },
                {
                    label: "Hack-Amount",
                    value:
                        progress(
                            Math.ceil(ns.getServerMaxMoney(args.target) * args.ratio),
                            ns.getServerMaxMoney(args.target)
                        ) +
                        " " +
                        currency.format(Math.ceil(ns.getServerMaxMoney(args.target) * args.ratio))
                }
            ])
        );

        check(ns, "validate", [ruleNotOwned(args.target), ruleMinSecurity(ns, args.target), ruleMaxMoney(ns, args.target)]);
        const config = compile(ns, args);
        test(ns, config);
        const result = await run(ns, args, config);
        check(ns, "verify", [
            ruleBatchStarted(result),
            ruleBatchComplete(ns, result),
            ruleMinSecurity(ns, args.target),
            ruleMaxMoney(ns, args.target)
        ]);
        await ns.sleep(args.sleep);
    }
}

function compile(ns: NS, args: any): Config {
    const wTime = Math.ceil(ns.getWeakenTime(args.target));
    const gTime = Math.ceil(ns.getGrowTime(args.target));
    const hTime = Math.ceil(ns.getHackTime(args.target));
    const delayGrowWeaken = args.delay * 2;
    const delayGrow = wTime - gTime - args.delay;
    const delayHack = wTime - delayGrowWeaken - delayGrow - hTime - args.delay;
    const hackAmount = Math.ceil(ns.getServerMaxMoney(args.target) * args.ratio);
    const hackThreads = Math.ceil(ns.hackAnalyzeThreads(args.target, hackAmount));
    const hackWeakenAmount = ns.hackAnalyzeSecurity(hackThreads);
    const hackWeakenThreads = analyzeWeakenThreads(ns, 1, hackWeakenAmount);
    const remainingMoney = ns.getServerMaxMoney(args.target) - hackAmount;
    const growRatio = ns.getServerMaxMoney(args.target) / remainingMoney;
    const growThreads = Math.ceil(ns.growthAnalyze(args.target, growRatio, 1));
    const growWeakenAmount = ns.growthAnalyzeSecurity(growThreads);
    const growWeakenThreads = analyzeWeakenThreads(ns, 1, growWeakenAmount);
    const waitEnd = hTime + 4 * args.delay;

    

    return {
        hackWeakenThreads: hackWeakenThreads,
        growWeakenThreads: growWeakenThreads,
        growThreads: growThreads,
        hackThreads: hackThreads,
        delayGrowWeaken: delayGrowWeaken,
        delayGrow: delayGrow,
        delayHack: delayHack,
        waitEnd: waitEnd
    };
}

function test(ns: NS, config: Config) {
    let valid = true;

    valid = config.hackThreads !== 0 && valid;
    valid = config.hackWeakenThreads !== 0 && valid;
    valid = config.growThreads !== 0 && valid;
    valid = config.growWeakenThreads !== 0 && valid;

    if (valid) {
        return;
    } else {
        ns.tail();
        error(
            ns,
            "\n" +
                form([
                    { label: "Hack-Threads", value: float.format(config.hackThreads) },
                    { label: "Weaken-Hack-Threads", value: float.format(config.hackWeakenThreads) },
                    { label: "Grow-Threads", value: float.format(config.growThreads) },
                    { label: "Weaken-Grow-Threads", value: float.format(config.growWeakenThreads) }
                ])
        );
        ns.exit();
    }
}

async function run(ns: NS, args: any, config: Config): Promise<Result> {
    const hackWeakenRam = ns.getScriptRam(Thread.weaken) * config.hackWeakenThreads;
    const growWeakenRam = ns.getScriptRam(Thread.weaken) * config.growWeakenThreads;
    const growRam = ns.getScriptRam(Thread.grow) * config.growThreads;
    const hackRam = ns.getScriptRam(Thread.hack) * config.hackThreads;
    const totalRam = hackWeakenRam + growWeakenRam + growRam + hackRam;
    ns.print(
        form([
            {
                label: "Hack",
                value: ns.sprintf(
                    "%s %5sGB (%4s%%)",
                    progress(hackRam, totalRam),
                    integer.format(hackRam),
                    float.format((hackRam / totalRam) * 100)
                )
            },
            {
                label: "Weaken-Hack",
                value: ns.sprintf(
                    "%s %5sGB (%4s%%)",
                    progress(hackWeakenRam, totalRam),
                    integer.format(hackWeakenRam),
                    float.format((hackWeakenRam / totalRam) * 100)
                )
            },
            {
                label: "Grow",
                value: ns.sprintf(
                    "%s %5sGB (%4s%%)",
                    progress(growRam, totalRam),
                    integer.format(growRam),
                    float.format((growRam / totalRam) * 100)
                )
            },
            {
                label: "Weaken-Grow",
                value: ns.sprintf(
                    "%s %5sGB (%4s%%)",
                    progress(growWeakenRam, totalRam),
                    integer.format(growWeakenRam),
                    float.format((growWeakenRam / totalRam) * 100)
                )
            },
            {
                label: "Total",
                value: ns.sprintf("%18sGB", integer.format(totalRam))
            }
        ])
    );

    info(ns, ns.sprintf("run %s --end=%s", Thread.weaken, now(ns.getWeakenTime(args.target) + args.delay)));
    const hWPid = ns.run(
        Thread.weaken,
        config.hackWeakenThreads,
        "--target=" + args.target,
        "--parent=" + ns.getScriptName(),
        "--start=" + now(),
        "--correlation="+args.correlation
    );
    await ns.sleep(config.delayGrowWeaken);

    info(ns, ns.sprintf("run %s --end=%s", Thread.weaken, now(ns.getWeakenTime(args.target) + args.delay)));
    const gWPid = ns.run(
        Thread.weaken,
        config.growWeakenThreads,
        "--target=" + args.target,
        "--parent=" + ns.getScriptName(),
        "--start=" + now(),
        "--correlation="+args.correlation
    );
    await ns.sleep(config.delayGrow);

    info(ns, ns.sprintf("run %s --end=%s", Thread.grow, now(ns.getGrowTime(args.target) + args.delay)));
    const gPid = ns.run(
        Thread.grow,
        config.growThreads,
        "--target=" + args.target,
        "--parent=" + ns.getScriptName(),
        "--start=" + now(),
        "--correlation="+args.correlation
    );
    await ns.sleep(config.delayHack);

    info(ns, ns.sprintf("run %s --end=%s", Thread.hack, now(ns.getHackTime(args.target) + args.delay)));
    const hPid = ns.run(
        Thread.hack,
        config.hackThreads,
        "--target=" + args.target,
        "--parent=" + ns.getScriptName(),
        "--start=" + now(),
        "--correlation="+args.correlation
    );
    await ns.sleep(config.waitEnd);

    return { growPid: gPid, hackPid: hPid, growWeakenPid: gWPid, hackWeakenPid: hWPid };
}

/**
 * ██╗░░░██╗████████╗██╗██╗░░░░░██╗████████╗██╗░░░██╗
 * ██║░░░██║╚══██╔══╝██║██║░░░░░██║╚══██╔══╝╚██╗░██╔╝
 * ██║░░░██║░░░██║░░░██║██║░░░░░██║░░░██║░░░░╚████╔╝░
 * ██║░░░██║░░░██║░░░██║██║░░░░░██║░░░██║░░░░░╚██╔╝░░
 * ╚██████╔╝░░░██║░░░██║███████╗██║░░░██║░░░░░░██║░░░
 * ░╚═════╝░░░░╚═╝░░░╚═╝╚══════╝╚═╝░░░╚═╝░░░░░░╚═╝░░░
 */

const currency = new Intl.NumberFormat("en-us", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

/**
 * ██████╗░██╗░░░██╗██╗░░░░░███████╗░██████╗
 * ██╔══██╗██║░░░██║██║░░░░░██╔════╝██╔════╝
 * ██████╔╝██║░░░██║██║░░░░░█████╗░░╚█████╗░
 * ██╔══██╗██║░░░██║██║░░░░░██╔══╝░░░╚═══██╗
 * ██║░░██║╚██████╔╝███████╗███████╗██████╔╝
 * ╚═╝░░╚═╝░╚═════╝░╚══════╝╚══════╝╚═════╝░
 */

function ruleBatchStarted(result: Result): Rule {
    return {
        name: "Initilised",
        message: "Batch started correctly",
        valid: result.growPid !== 0 && result.growWeakenPid !== 0 && result.hackPid !== 0 && result.hackWeakenPid !== 0
    };
}

function ruleBatchComplete(ns: NS, result: Result): Rule {
    const ps = ns.ps();

    return {
        name: "Complete",
        message: "Batch finished execution.",
        valid:
            ps.find(
                p =>
                    p.pid === result.growPid ||
                    p.pid === result.hackPid ||
                    p.pid === result.growWeakenPid ||
                    p.pid === result.hackWeakenPid
            ) === undefined
    };
}

/**
 * ████████╗██╗░░░██╗██████╗░███████╗░██████╗
 * ╚══██╔══╝╚██╗░██╔╝██╔══██╗██╔════╝██╔════╝
 * ░░░██║░░░░╚████╔╝░██████╔╝█████╗░░╚█████╗░
 * ░░░██║░░░░░╚██╔╝░░██╔═══╝░██╔══╝░░░╚═══██╗
 * ░░░██║░░░░░░██║░░░██║░░░░░███████╗██████╔╝
 * ░░░╚═╝░░░░░░╚═╝░░░╚═╝░░░░░╚══════╝╚═════╝░
 */

interface Config {
    hackWeakenThreads: number;
    growWeakenThreads: number;
    growThreads: number;
    hackThreads: number;
    delayGrowWeaken: number;
    delayGrow: number;
    delayHack: number;
    waitEnd: number;
}

interface Result {
    growPid: number;
    hackPid: number;
    growWeakenPid: number;
    hackWeakenPid: number;
}
