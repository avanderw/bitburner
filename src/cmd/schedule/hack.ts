import { NS, Server } from "../../bitburner/NetscriptDefinitions";
import { init } from "/cmd/util/init";
import { Daemon } from "/type/CustomEnums";
import { error, now, info } from "../../util/tail";
import { asciiTitle } from "../../format/ascii-title";
import { form, progress } from "/util/format";
import { check, Rule, ruleMaxMoney, ruleMinSecurity, ruleNotOwned } from "/util/rules";

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}

const float = new Intl.NumberFormat("en-us", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const integer = new Intl.NumberFormat("en-us", { maximumFractionDigits: 0, minimumFractionDigits: 0 });

export async function main(ns: NS) {
    const args = init(
        ns,
        ["Calculate the batches required to hack a target."],
        [
            { option: "target", desc: "Target for the hack.", default: ns.getHostname() },
            { option: "ratio", desc: "Ratio of funds to hack of the available.", default: 0.75 },
            { option: "delay", desc: "Timing schedule between threads.", default: 200 }
        ]
    );

    ns.print(asciiTitle("schedule-hack"));
    ns.print(
        form([
            { label: "Target", value: args.target },
            { label: "Delay", value: integer.format(args.delay) + "ms" }
        ])
    );

    check(ns, "validate", [ruleNotOwned(args.target), ruleMinSecurity(ns, args.target), ruleMaxMoney(ns, args.target)]);
    const config = compile(ns, args);
    test(ns, args, config);
    const result: Result = await run(ns, args, config);
    ns.print("");
    check(ns, "verify", [rulesAllStarted(result)]);
}

function compile(ns: NS, args: any): Config {
    const batchDuration = 5 * args.delay;
    const available = ns.getWeakenTime(args.target) - args.delay;
    const numBatches = Math.floor(available / batchDuration);

    const hackAmount = Math.ceil(ns.getServerMaxMoney(args.target) * args.ratio);
    ns.print(
        form([
            {
                label: "Hack-Amount",
                value: progress(hackAmount, ns.getServerMaxMoney(args.target)) + " " + currency.format(hackAmount)
            },
            { label: "Number of batches", value: integer.format(numBatches) },
            { label: "Batch duration", value: integer.format(batchDuration) + "ms" },
            { label: "Total duration", value: integer.format(numBatches * batchDuration) + "ms" },
            { label: "Time available", value: integer.format(available) + "ms" },
            { label: "Max profit", value: currency.format(((hackAmount * numBatches) / available) * 1000) + "/s" }
        ])
    );

    return { numBatches: numBatches, batchDuration: batchDuration };
}

function test(ns: NS, args: any, config: Config) {
    let valid = true;

    valid = valid && config.numBatches !== 0;
    valid = valid && config.numBatches * config.batchDuration < ns.getWeakenTime(args.target) - args.delay;

    if (valid) {
        return;
    } else {
        ns.tail();
        error(
            ns,
            "\n" +
                form([
                    { label: "Number of batches", value: integer.format(config.numBatches) },
                    { label: "Batch duration", value: integer.format(config.batchDuration) + "ms" },
                    {
                        label: "Total duration",
                        value: integer.format(config.numBatches * config.batchDuration) + "ms"
                    },
                    {
                        label: "Time available",
                        value: integer.format(ns.getWeakenTime(args.target) - args.delay) + "ms"
                    }
                ])
        );
        ns.exit();
    }
}

async function run(ns: NS, args: any, config: Config): Promise<Result> {
    const pids = [];
    info(
        ns,
        ns.sprintf(
            "Launching %s batches at intervals of %sms",
            integer.format(config.numBatches),
            integer.format(args.delay)
        )
    );

    // config.numBatches = 0;
    for (let i = 0; i < config.numBatches; i++) {
        if (args.dry) {
            info(
                ns,
                ns.sprintf("run %s --end=%s", Daemon.hack, now(ns.getWeakenTime(args.target) + config.batchDuration))
            );
        } else {
            pids.push(
                ns.run(
                    Daemon.hack,
                    1,
                    "--target=" + args.target,
                    "--ratio=" + args.ratio,
                    "--delay=" + args.delay,
                    "--sleep=" + Math.ceil(ns.getWeakenTime(args.target) + config.batchDuration),
                    args.debug ? "--debug" : "",
                    "--start=" + now(),
                    "--correlation=hack-" + (i + "").padStart(2, "0")
                )
            );
        }
        await ns.sleep(5 * args.delay);
    }
    info(ns, "Finished launching batches");
    return {
        pids: pids
    };
}

/**
 * |w--w--g--h--                          |w--w--g--h--
 *              |w--w--g--h--                          |w--w--g--h--
 *                           |w--w--g--h--                          |w--w--g--h--
 */

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

function rulesAllStarted(result: Result): Rule {
    return {
        name: "Initialised",
        message: "All batches started correctly",
        valid: result.pids.every(pid => pid !== 0)
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
    numBatches: number;
    batchDuration: number;
}

interface Result {
    pids: number[];
}
