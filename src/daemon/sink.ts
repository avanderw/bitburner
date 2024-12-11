import { NS } from "../bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    });
    const args = ns.flags([
        ["debug", false],
        ["port", []],
        ["dry", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h) {
        ns.tprint(`USAGE: run ${ns.getScriptName()} [optional] <required>`);
        ns.tprint("Read and log from target ports.");
        ns.tprint("      --dry       Log actions instead of make them.")
        ns.tprint("      --debug     Enable debug logging.");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    if (!args.debug) {
        ns.disableLog("ALL");
    }

    while (true) {
        if (args.debug) {
            ns.print(ns.sprintf("Reading %s ports", args.port.length));
        }
        (args.port as number[]).forEach(port=>{
            let packet = ns.readPort(port);
            while (packet !== "NULL PORT DATA") {
                ns.tprintf("%2s: %s", port, packet);
                packet = ns.readPort(port);
            }
        });

        await ns.sleep(30000);
    }

    ns.toast(`${ns.getScriptName()}`, "success");
}

export function autocomplete(data:any, args:any) {
    return [...data.servers, ...data.scripts, ...data.txts, "low", "medium", "high"];
}
