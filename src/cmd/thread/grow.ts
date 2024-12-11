import { init } from "/cmd/util/init";
import { NS } from "../../bitburner/NetscriptDefinitions";
import { info } from "../../util/tail";

export async function main(ns: NS) {
    const args = init(
        ns,
        ["Grow the target server."],
        [{ option: "target", desc: "Target for the grow.", default: ns.getHostname() }]
    );

    info(ns, ns.sprintf("grow //%s/", args.target));
    await ns.grow(args.target);
}
