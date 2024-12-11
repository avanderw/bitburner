/**
 * Version 1:
 *
 * 1. Purchase hardware from the market.
 * 2. Quit if the host max RAM is low.
 * 3. Purchase each level.
 * 4. Upgrade once the limit has been reached.
 * 5. Quit once there are no servers left to upgrade.
 */
export const version = "1.2-pre-alpha";

import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    ns.disableLog("ALL");

    const flags = ns.flags([["min-ram", 1024]]);
    while (true) {
        ns.clearLog();
        const hackCluster = buildHackClusterNames("pserver-", 25);
        hackCluster
            .filter(s => ns.serverExists(s))
            .filter(s => ns.getServerMaxRam(s) !== ns.getServerMaxRam("home"))
            .forEach(s => ns.deleteServer(s));
        hackCluster.filter(s => !ns.serverExists(s)).forEach(s => ns.purchaseServer(s, ns.getServerMaxRam("home")));
        hackCluster.filter(s=>ns.serverExists(s)).forEach(s => ns.print(s));

        await ns.sleep(1000);
        if (ns.getServerMaxRam("home") < flags["min-ram"]) {
            break;
        }
    }
}

function buildHackClusterNames(prefix: string, size: number): string[] {
    const hardcoded = [];
    for (let i = 1; i <= size; i++) {
        const hostname = prefix + i.toString().padStart(2, "0");

        hardcoded.push(hostname);
    }
    return hardcoded;
}
