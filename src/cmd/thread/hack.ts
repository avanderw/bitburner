import { init } from "/cmd/util/init";
import { NS } from "../../bitburner/NetscriptDefinitions";
import { info } from "../../util/tail";

export async function main(ns: NS) {
    const args = init(
        ns,
        ["Hack the target server."],
        [{ option: "target", desc: "Target for the hack.", default: ns.getHostname() }]
    );

    info(ns, ns.sprintf("hack //%s/", args.target));
    await ns.hack(args.target);
}
