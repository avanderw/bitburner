/**
 * Version 1: 
 * 
 * 1. Prepare target for hack.
 * 2. Stable hack target.
 * 3. Batch hack target.
 */
export const version: string = "1.1-pre-alpha";

import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    while (true) {
        ns.clearLog();
        growTarget(ns);
        hackTarget(ns);
    }
}

function growTarget(ns:NS) {
    
}

function hackTarget(ns:NS) {
    
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