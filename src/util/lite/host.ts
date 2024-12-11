import { getHackCluster } from "util/lite/cluster";
import { NS } from "../../bitburner/NetscriptDefinitions";

/**
 * Find the purchased server that has the most free RAM.
 * Fallback to 'home' if there are no purchased servers.
 *
 * @param ns
 * @returns
 */
export function getMaxFreeRamHost(ns: NS): string {
    const purchased = getHackCluster(ns, "pserver-");
    if (purchased.length > 0) {
        return purchased
            .sort((a, b) => ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - (ns.getServerMaxRam(b) - ns.getServerUsedRam(b)))
            .reverse()
            .find(s => true)!;
    } else {
        return "home";
    }
}
