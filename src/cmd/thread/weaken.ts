import { init } from "/cmd/util/init";
import { NS } from "../../bitburner/NetscriptDefinitions";
import { info } from "../../util/tail";

export async function main(ns: NS) {
    const args = init(
        ns,
        ["Weaken the target server."],
        [{ option: "target", desc: "Target for the weaken.", default: ns.getHostname() }]
    );

    info(ns, ns.sprintf("weaken //%s/", args.target));
    await ns.weaken(args.target);
}
