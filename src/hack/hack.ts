import { NS } from "/bitburner/NetscriptDefinitions";
import { analyzeWeakenThreads } from "/util/analyze"; // TODO: Move this to the hack package
import { error, info, warn } from "/log/in/api";
import { configDaemon, runDaemon, stopDaemon } from "/util/daemon";
import { Config, generateB3, startupScript } from "/util/script";

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}

export async function main(ns: NS) {
    const config = configDaemon(ns, "Hack", "Run a stable hack.", [
        { name: "target", help: "Target for the hack.", default: ns.getHostname() },
        { name: "ratio", help: "Ratio of funds to hack of the available.", default: 0.75 },
        { name: "delay", help: "Timing schedule between threads.", default: 200 }
    ]);
    startupScript(ns, config);
    await validateTarget(ns, config);
    await unlock(ns, config);
    await runDaemon(ns, config, daemon);
}

async function daemon(ns: NS, config: Config) {
    if (noLock(ns, config)) {
        if (atMinSecurity(ns, config.target) && atMaxMoney(ns, config.target)) {
            const schedule = await compileSchedule(ns, config);
            await validateSchedule(ns, config, schedule);
            await executeSchedule(ns, config, schedule);
            await validateStable(ns, config);
        } else {
            await error(ns, config, "Server is not prepared. Stopping daemon.");
            stopDaemon(ns, config);
        }
    } else {
        warn(ns, config, "Hack locked by another process. Delaying this schedule.");
    }
}

function noLock(ns: NS, config: Config): boolean {
    return !ns.fileExists(`/lock/${config.target}.txt`);
}

async function validateTarget(ns: NS, config: Config) {
    if (config.target === "home") {
        await error(ns, config, "Cannot hack home. Stopping daemon.");
        ns.exit();
    }

    if (ns.getServerMaxMoney(config.target) === 0) {
        await error(ns, config, "Cannot hack target that has no money. Stopping daemon.");
        ns.exit();
    }
}

async function compileSchedule(ns: NS, config: Config): Promise<any> {
    const wTime = Math.ceil(ns.getWeakenTime(config.target));
    const gTime = Math.ceil(ns.getGrowTime(config.target));
    const hTime = Math.ceil(ns.getHackTime(config.target));
    const delayGrowWeaken = config.delay * 2;
    const delayGrow = wTime - gTime - config.delay;
    const delayHack = wTime - delayGrowWeaken - delayGrow - hTime - config.delay;
    const hackAmount = Math.ceil(ns.getServerMaxMoney(config.target) * config.ratio);
    const hackThreads = Math.ceil(ns.hackAnalyzeThreads(config.target, hackAmount));
    const hackWeakenAmount = ns.hackAnalyzeSecurity(hackThreads);
    const hackWeakenThreads = analyzeWeakenThreads(ns, 1, hackWeakenAmount);
    const remainingMoney = ns.getServerMaxMoney(config.target) - hackAmount;
    const growRatio = ns.getServerMaxMoney(config.target) / remainingMoney;
    const growThreads = Math.ceil(ns.growthAnalyze(config.target, growRatio, 1));
    const growWeakenAmount = ns.growthAnalyzeSecurity(growThreads);
    const growWeakenThreads = analyzeWeakenThreads(ns, 1, growWeakenAmount);

    return {
        hackWeakenThreads: hackWeakenThreads,
        growWeakenThreads: growWeakenThreads,
        growThreads: growThreads,
        hackThreads: hackThreads,
        delayGrowWeaken: delayGrowWeaken,
        delayGrow: delayGrow,
        delayHack: delayHack
    };
}

async function validateSchedule(
    ns: NS,
    config: Config,
    schedule: { hackThreads: number; hackWeakenThreads: number; growThreads: number; growWeakenThreads: number }
) {
    let valid = true;
    valid = schedule.hackThreads !== 0 && valid;
    valid = schedule.hackWeakenThreads !== 0 && valid;
    valid = schedule.growThreads !== 0 && valid;
    valid = schedule.growWeakenThreads !== 0 && valid;

    if (!valid) {
        await error(ns, config, "Schedule will not result in a stable hack. Stopping daemon.");
        ns.exit();
    }
}

async function executeSchedule(
    ns: NS,
    config: Config,
    schedule: {
        hackThreads: number;
        hackWeakenThreads: number;
        growThreads: number;
        growWeakenThreads: number;
        delayGrowWeaken: number;
        delayGrow: number;
        delayHack: number;
    }
): Promise<void> {
    await info(
        ns,
        config,
        `Executing hack which will take ${millisToMinutesAndSeconds(
            Math.ceil(ns.getWeakenTime(config.target)) + 4 * config.delay
        )}`
    );
    const hWPid = ns.run(
        "/hack/thread/weaken.js",
        schedule.hackWeakenThreads,
        "--target=" + config.target,
        "--b3=" + generateB3(config),
        "0"
    );
    await ns.sleep(schedule.delayGrowWeaken);

    const gWPid = ns.run(
        "/hack/thread/weaken.js",
        schedule.growWeakenThreads,
        "--target=" + config.target,
        "--b3=" + generateB3(config),
        "1"
    );
    await ns.sleep(schedule.delayGrow);

    const gPid = ns.run(
        "/hack/thread/grow.js",
        schedule.growThreads,
        "--target=" + config.target,
        "--b3=" + generateB3(config)
    );
    await ns.sleep(schedule.delayHack);

    const hPid = ns.run(
        "/hack/thread/hack.js",
        schedule.hackThreads,
        "--target=" + config.target,
        "--b3=" + generateB3(config)
    );
    await ns.sleep(Math.ceil(ns.getHackTime(config.target)));
    await waitFor(ns, config, hPid);
    await lock(ns, config);
    await ns.sleep(config.delay);
    await ns.sleep(config.delay);
    await ns.sleep(config.delay);
    await waitFor(ns, config, hWPid, gPid, gWPid);
    await unlock(ns, config);
}

async function waitFor(ns: NS, config: Config, ...pids: number[]) {
    while (!ns.ps().every(process => pids.indexOf(process.pid) < 0)) {
        await ns.sleep(50);
    }
}

async function validateStable(ns: NS, config: Config) {
    if (!atMaxMoney(ns, config.target) || !atMinSecurity(ns, config.target)) {
        error(ns, config, "Hack is not stable. Stopping daemon.");
        ns.exit();
    }
}

async function lock(ns: NS, config: Config) {
    await ns.write(`/lock/${config.target}.txt`, "w");
}

async function unlock(ns: NS, config: Config) {
    const file = `/lock/${config.target}.txt`;
    if (ns.fileExists(file)) ns.rm(file);
}

function atMaxMoney(ns: NS, target: string): boolean {
    return ns.getServerMoneyAvailable(target) === ns.getServerMaxMoney(target);
}

function atMinSecurity(ns: NS, target: string): boolean {
    return ns.getServerSecurityLevel(target) === ns.getServerMinSecurityLevel(target);
}

function millisToMinutesAndSeconds(millis: number): string {
    var minutes = Math.floor(millis / 60000);
    var seconds = Math.floor((millis % 60000) / 1000);
    return seconds === 60 ? minutes + 1 + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
