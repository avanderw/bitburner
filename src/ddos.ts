import { NS } from "./bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    });
    const args = ns.flags([
        ["debug", false],
        ["threads", -1],
        ["dry", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h || args.length < 1) {
        ns.tprint(`USAGE: run ${ns.getScriptName()} <target>`);
        ns.tprint("Will use all owned servers for an attack.");
        ns.tprint("      <target>    Server to hack.");
        ns.tprint("      --threads   Thread count per process. (default: max)");
        ns.tprint("      --dry       Log actions instead of make them.");
        ns.tprint("      --debug     Enable debug logging.");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    if (!args.debug) {
        ns.disableLog("ALL");
    }

    const target = args._[0];
    for (let i = 0; i < ns.getPurchasedServers().length; i++) {
        const host = `pserver-${i}`;
        if (ns.serverExists(host)) {
            if (args.dry) {
                ns.tprintf("Attacking %s with %s", target, host);
            } else {
                ns.killall(host);
                ns.run("attack.js", 1, target, "--host", host, "--threads", args.threads);
            }
        }
    }
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}
