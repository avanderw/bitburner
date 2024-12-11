import { NS } from "./bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    });
    const args = ns.flags([
        ["uuid4", ""],
        ["reserve", 0],
        ["debug", false],
        ["dry", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h) {
        ns.tprint(`USAGE: run ${ns.getScriptName()} [optional] <required>`);
        ns.tprint("This script will ...");
        ns.tprint("      --uuid4     Unique ID for the script.");
        ns.tprint("      --dry       Log actions instead of make them.")
        ns.tprint("      --debug     Enable debug logging.");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    if (!args.debug) {
        ns.disableLog("ALL");
    }

    const jsFiles = ns.ls("home", ".js");
    for (let i = 0; i < jsFiles.length; i++) {
        if (args.dry) {
            ns.tprintf("%s removed", jsFiles[i]);
        } else {
            ns.rm(jsFiles[i]);
        }
    }

    ns.toast(`${ns.getScriptName()}`, "success");
}
