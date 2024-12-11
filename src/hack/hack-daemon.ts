/**
 * MUST grow when in a long position
 * MUST hack when in a short position
 * MUST dynamically convert to batch schedules when memory allows it
 */
import { NS } from "/lib/NetscriptDefinitions";

export function autocomplete(data: any) {
    return [...data.servers];
}

export async function main(ns: NS) {
    ns.clearLog();
    ns.disableLog("getServerUsedRam");
    ns.disableLog("getServerMaxRam");
    ns.disableLog("scan");
    if (ns.args.length === 0) {
        ns.tprintf("Usage: hack-daemon <target>");
        return;
    }

    const target = ns.args[0] as string;
    const useHome = ns.flags([['use-home', false]])['use-home'] as boolean;
    const WEAKEN = "/hack/weaken-thread.js";
    const HACK = "/hack/hack-thread.js";
    const GROW = "/hack/grow-thread.js";
    const PER_WEAKEN_SECURITY = 0.05;
    const PER_GROW_SECURITY = 0.004;

    let targetRatio = 0.32;
    const hackThreads = Math.ceil(targetRatio / ns.hackAnalyze(target));
    const hackSecurityEffect = ns.hackAnalyzeSecurity(hackThreads, target);
    const hackWeakenThreads = Math.ceil(hackSecurityEffect / PER_WEAKEN_SECURITY);

    const realRatio = hackThreads * ns.hackAnalyze(target);
    const growThreads = Math.ceil(ns.growthAnalyze(target, 1 / realRatio));
    const growWeakenThreads = Math.ceil((PER_GROW_SECURITY * growThreads) / PER_WEAKEN_SECURITY);

    while (true) {
        ns.print(`INFO ${target} ratio ${targetRatio}`);
        if (!stable(ns, target)) {
            ns.printf(`ERROR ${target} is unstable`);
            await ns.sleep(5000);
        }

        const delay = 500;
        const hackWeakenEnd = ns.getWeakenTime(target);
        const hackEnd = hackWeakenEnd - delay;
        const growEnd = hackWeakenEnd + delay;
        const growWeakenEnd = growEnd + delay;
        const batchEnd = growWeakenEnd + delay;

        const hackStart = hackEnd - ns.getHackTime(target);
        const growStart = growEnd - ns.getGrowTime(target);
        const growWeakenStart = growWeakenEnd - ns.getWeakenTime(target);

        let elapsed = 0;
        let start = new Date().getTime();
        let outstanding = fire(ns, WEAKEN, target, hackWeakenThreads, useHome);
        if (outstanding > 0) {
            await ns.sleep(batchEnd - elapsed);
            continue;
        }

        await ns.sleep(growWeakenStart - elapsed);
        elapsed = new Date().getTime() - start;
        outstanding = fire(ns, WEAKEN, target, growWeakenThreads, useHome)
        if (outstanding > 0) {
            await ns.sleep(batchEnd - elapsed);
            targetRatio = decreaseRatio(targetRatio);
            continue;
        }

        await ns.sleep(growStart - elapsed);
        elapsed = new Date().getTime() - start;
        outstanding = fire(ns, GROW, target, growThreads, useHome);
        if (outstanding > 0) {
            await ns.sleep(batchEnd - elapsed);
            targetRatio = decreaseRatio(targetRatio);
            continue;
        }

        await ns.sleep(hackStart - elapsed);
        elapsed = new Date().getTime() - start;
        outstanding = fire(ns, HACK, target, hackThreads, useHome);
        await ns.sleep(batchEnd - elapsed);
        if (outstanding > 0) {
            targetRatio = decreaseRatio(targetRatio);
        } else {
            targetRatio = increaseRatio(targetRatio);
        }
    }
}

function decreaseRatio(ratio: number): number {
    return Math.max(0.01, ratio - 0.02);
}

function increaseRatio(ratio: number): number {
    return Math.min(0.99, ratio + 0.02);
}

function fire(ns: NS, script: string, target: string, threads: number, useHome:boolean) {
    if (threads <= 0) {
        ns.printf("ERROR No threads to fire");
        ns.tail();
        ns.exit();
        return 1;
    }

    let remainingGrowThreads = threads;
    traverseNet(ns)
        .filter(s => ns.hasRootAccess(s))
        .filter(s => freeRAM(ns, s) > ns.getScriptRam(script))
        .filter(s => useHome || s !== "home")
        .sort((a, b) => freeRAM(ns, a) - freeRAM(ns, b)).reverse()
        .forEach(s => {
            if (remainingGrowThreads <= 0) {
                return;
            }
            const assignThreads = Math.min(remainingGrowThreads, Math.floor(freeRAM(ns, s) / ns.getScriptRam(script)));
            ns.scp(script, s);
            ns.exec(script, s, assignThreads, target, uuidv4());
            remainingGrowThreads -= assignThreads;
        });

    if (remainingGrowThreads > 0) {
        ns.printf("ERROR Not enough RAM to fire all threads");
    }
    return remainingGrowThreads;
}

function traverseNet(ns: NS): string[] {
    const process = ["home"];
    const visited: string[] = [];
    while (process.length > 0) {
        const current = process.pop()!;
        const servers = ns.scan(current);
        for (const server of servers) {
            if (!visited.includes(server) && !process.includes(server)) {
                process.push(server);
            }
        }

        visited.push(current);
    }
    return visited;
}

function freeRAM(ns: NS, host: string): number {
    return ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function stable(ns: NS, host: string): boolean {
    return ns.getServerSecurityLevel(host) === ns.getServerMinSecurityLevel(host) 
    && ns.getServerMoneyAvailable(host) === ns.getServerMaxMoney(host);
}