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
        ns.tprint(`USAGE: run ${ns.getScriptName()} [cct|lit|all]`);
        ns.tprint("Fetch files from servers.");
        ns.tprint("      --uuid4     Unique ID for the script.");
        ns.tprint("      --dry       Log actions instead of make them.");
        ns.tprint("      --debug     Enable debug logging.");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    if (!args.debug) {
        ns.disableLog("ALL");
    }

    const ALL = ["txt", "lit", "script"];
    const grep = args._[0] || "all";
    const servers = scan(ns);
    for (let i = 0; i < servers.length; i++) {
        if (grep === "all") {
            for (let j = 0; j < ALL.length; j++) {
                await copy(servers[i].hostname, ALL[j], ns, args.dry);
            }
        } else {
            await copy(servers[i].hostname, grep, ns, args.dry);
        }
    }

    ns.toast(`${ns.getScriptName()}`, "success");
}

async function copy(host:string, ext:string, ns:NS, dryRun:boolean):Promise<void> {
    if (host === "home") {
        return;
    }
    const files = ns.ls(host, `.${ext}`);
    
    for (let i = 0; i < files.length; i++) {
        if (dryRun) {
            ns.tprintf("scp %s %s %s", files, host, "home");
        } else {
            await ns.scp(files, host, "home");
        }
    }
}

export function autocomplete(data: any, args: any) {
    return [...data.servers, ...data.scripts, ...data.txts, "low", "medium", "high"];
}
