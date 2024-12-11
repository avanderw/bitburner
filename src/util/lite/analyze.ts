import { ScriptConfig } from "../../bitburner/CustomDefinitions";
import { NS } from "../../bitburner/NetscriptDefinitions";

export function analyzeRequiredRuns(
    ns: NS,
    script: string,
    host: string,
    requiredThreads: number,
    freeRam: number = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
): ScriptConfig {
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

/**
 * Iterative function to determine how many threads are required to achieve the weaken amount.
 * @param ns Bitburner scripts.
 * @param cores The number of cores on the server.
 * @param weakenAmount The security decrease.
 * @returns The amount of required threads.
 */
 export function analyzeWeakenThreads(ns: NS, cores: number, weakenAmount: number): number {
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

export function analyzeMoneyPerSecond(ns: NS, server: string): number {
    return (
        (ns.hackAnalyzeChance(server) *
            ns.hackAnalyze(server) *
            ns.getServerMoneyAvailable(server)) /
        ns.getHackTime(server)
    );
}