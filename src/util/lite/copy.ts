import { getHackCluster } from "/util/lite/cluster";
import { Thread } from "/type/CustomEnums";
import { NS } from "../../bitburner/NetscriptDefinitions";

export async function copyScripts(ns: NS, args: any) {
    const servers = getHackCluster(ns, "pserver-");
    for (let i = 0; i < servers.length; i++) {
        if (!ns.fileExists(Thread.weaken, servers[i])) {
            await ns.scp(ns.ls("home", ".js"), "home", servers[i]);
        }
    }
}
