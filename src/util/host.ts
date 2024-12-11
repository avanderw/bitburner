import { NS, Server } from "../bitburner/NetscriptDefinitions";

/**
 * Find the purchased server that has the most free RAM.
 * Fallback to 'home' if there are no purchased servers.
 *
 * @param ns
 * @returns
 */
export function getMaxFreeRamHost(ns: NS): Server {
    const purchased = ns.getPurchasedServers();
    if (purchased.length > 0) {
        return ns
            .getPurchasedServers()
            .map(n => ns.getServer(n))
            .sort((a, b) => a.maxRam - a.ramUsed - (b.maxRam - b.ramUsed))
            .reverse()
            .find(s => true)!;
    } else {
        return ns.getServer("home");
    }
}
