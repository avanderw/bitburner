import { NS } from "../../bitburner/NetscriptDefinitions";

export function getHackCluster(ns: NS, prefix:string): string[] {
    const hardcoded = [];
    for (let i = 0; i < 25; i++) {
        const hostname = prefix + i;
        if (ns.serverExists(hostname)) {
            hardcoded.push(hostname);
        }
    }
    return hardcoded;
}
