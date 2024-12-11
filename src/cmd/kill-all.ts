import { init } from "/daemon/util/init";
import { NS } from "../bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const args = init(ns, ["Kill all processes on all owned servers."], []);
    ns.getPurchasedServers().forEach(s => ns.killall(s));
    ns.killall("home");
    ns.tprint("poephol");
}
