import { NS } from "./bitburner/NetscriptDefinitions";
import { scan } from "/util/scan";

export async function main(ns: NS) {
    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    });
    const args = ns.flags([
        ["uuid4", ""],
        ["debug", false],
        ["dry", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h) {
        ns.tprint(`USAGE: run ${ns.getScriptName()} <server>`);
        ns.tprint("Connect to a server. (Singularity 4.1)");
        ns.tprint("      --uuid4     Unique ID for the script.");
        ns.tprint("      --dry       Log actions instead of make them.")
        ns.tprint("      --debug     Enable debug logging.");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    if (!args.debug) {
        ns.disableLog("ALL");
    }

    const server:string = ns.args[0] as string;
    scan(ns).filter(s=>s.hostname === server).forEach(s=> {
        let command = "";
        for (let i = 0; i < s.path.length; i++) {
            command += `connect ${s.path[i]};`
        }
        ns.tprint(command + `connect ${s.hostname}`);
    });
}

export function autocomplete(data:any, args:any) {
    return [...data.servers];
}
