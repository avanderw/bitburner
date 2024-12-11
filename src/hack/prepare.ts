import { NS } from "/bitburner/NetscriptDefinitions";
import { error, info, warn } from "/log/in/api";
import { trace } from "/trace/in/api";
import { configDaemon, runDaemon, stopDaemon } from "/util/daemon";
import { Config, generateB3, startupScript } from "/util/script";

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}

export async function main(ns: NS) {
    const start = new Date().getTime();
    const config = configDaemon(ns, "Prepare", "Prepare a server to min security and max money for optimal hacking.", [
        { name: "target", help: "Target for the hack.", default: ns.getHostname() },
        { name: "ram", help: "The ratio of the free RAM to use.", default: 0.8 }
    ]);
    startupScript(ns, config);

    if (ns.hasRootAccess(config.target)) {
        await runDaemon(ns, config, prepare);
    } else {
        const message = `${ns.getScriptName()} requires root access. Stopping daemon.`;
        await error(ns, config, message);
        ns.alert(message);
    }

    await trace(ns, config.traceId, config.spanId, config.target, start, new Date().getTime() - start, config.parentId);
}

async function prepare(ns: NS, config: Config) {
    if (atMinSecurity(ns, config.target)) {
        if (atMaxMoney(ns, config.target)) {
            await info(ns, config, "Server is prepared. Stopping daemon.");
            stopDaemon(ns, config);
        } else {
            await grow(ns, config);
        }
    } else {
        await weaken(ns, config);
    }
}

async function grow(ns: NS, config: Config) {
    const host = findHighestFreeRamHost(ns);
    const free = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
    const growRatio = ns.getServerMaxMoney(config.target) / ns.getServerMoneyAvailable(config.target);
    const growThreads = Math.ceil(ns.growthAnalyze(config.target, growRatio, 1));
    const growRun = analyzeRequiredRuns(ns, "/hack/thread/grow.js", host, growThreads, Math.ceil(free * config.ram));
    const growSecurity = ns.growthAnalyzeSecurity(growRun.threads);
    const weakenThreads = analyzeWeakenThreads(ns, 1, growSecurity);
    const weakenRun = analyzeRequiredRuns(
        ns,
        "/hack/thread/weaken.js",
        host,
        weakenThreads,
        Math.ceil(Math.max(0, free - growRun.ram * config.ram))
    );

    if (growRun.runs < 1 || weakenRun.runs !== 1) {
        await warn(ns, config, "Not enough threads to grow. Skipping grow this iteration.");
        await ns.sleep(config.sleep);
    } else {
        await info(ns, config, `Using ${integer.format(growRun.ram)}GB to grow with ${integer.format(growRun.threads)} threads`);
        const growPid = ns.exec(
            "/hack/thread/grow.js",
            host,
            growRun.threads,
            "--target=" + config.target,
            `--b3=${generateB3(config)}`
        );
        const weakenPid = ns.exec(
            "/hack/thread/weaken.js",
            host,
            weakenRun.threads,
            "--target=" + config.target,
            `--b3=${generateB3(config)}`
        );

        if (growPid === 0 || weakenPid === 0) {
            ns.tail();
            await error(ns, config, "Could not start grow thread.");
            throw new Error("Not supported!");
        }
        await ns.sleep(Math.ceil(ns.getWeakenTime(config.target)));
    }
}

const integer = new Intl.NumberFormat();
async function weaken(ns: NS, config: Config) {
    const host = findHighestFreeRamHost(ns);
    const free = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
    const weakenAmount = ns.getServerSecurityLevel(config.target) - ns.getServerMinSecurityLevel(config.target);
    const weakenThreads = analyzeWeakenThreads(ns, 1, weakenAmount);
    const weakenRun = analyzeRequiredRuns(
        ns,
        "/hack/thread/weaken.js",
        host,
        weakenThreads,
        Math.ceil(free * config.ram)
    );

    if (weakenRun.threads < 1) {
        await warn(ns, config, "Not enough threads to weaken on //${host}/");
        await info(ns, config, "Skipping weaken this iteration.");
        await ns.sleep(config.sleep);
    } else {
        await info(ns, config, `Using ${integer.format(weakenRun.ram)}GB to weaken with ${integer.format(weakenRun.threads)} threads`);
        const weakenPid = ns.exec(
            "/hack/thread/weaken.js",
            host,
            weakenRun.threads,
            "--target=" + config.target,
            `--b3=${generateB3(config)}`
        );
        if (weakenPid === 0) {
            ns.tail();
            await error(ns, config, "Could not start weaken thread.");
            throw new Error("Not supported!");
        }
        await ns.sleep(Math.ceil(ns.getWeakenTime(config.target)));
    }
}

/**
 * Iterative function to determine how many threads are required to achieve the weaken amount.
 * @param ns Bitburner scripts.
 * @param cores The number of cores on the server.
 * @param weakenAmount The security decrease.
 * @returns The amount of required threads.
 */
function analyzeWeakenThreads(ns: NS, cores: number, weakenAmount: number): number {
    let found = false;
    let threads = 1;
    while (!found) {
        const potential = ns.weakenAnalyze(threads, cores);
        if (potential >= weakenAmount) {
            found = true;
        }
        threads++;
    }
    return threads;
}

function analyzeRequiredRuns(
    ns: NS,
    script: string,
    host: string,
    requiredThreads: number,
    freeRam: number = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
) {
    const scriptRam = ns.getScriptRam(script, host);
    if (requiredThreads === 0 || scriptRam > freeRam) {
        return { runs: 0, threads: 0, ram: 0 };
    }
    const maxThreads = Math.floor(freeRam / scriptRam);
    const allocateThreads = Math.min(requiredThreads, maxThreads);
    const allocateRam = allocateThreads * scriptRam;
    const allocateRuns = Math.ceil(requiredThreads / allocateThreads);
    return { runs: allocateRuns, threads: allocateThreads, ram: allocateRam };
}

function findHighestFreeRamHost(ns: NS): string {
    const purchased = buildHackClusterNames(ns, "pserver-", 25);
    if (purchased.length > 0) {
        return purchased
            .sort(
                (a, b) =>
                    ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - (ns.getServerMaxRam(b) - ns.getServerUsedRam(b))
            )
            .reverse()
            .find(s => true)!;
    } else {
        return "home";
    }
}

function buildHackClusterNames(ns: NS, prefix: string, size: number): string[] {
    const hardcoded = [];
    for (let i = 0; i < size; i++) {
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
