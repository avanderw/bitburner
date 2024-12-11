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
        ["debug", false],
        ["dry", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h) {
        ns.tprint(`USAGE: run ${ns.getScriptName()} [optional] <required>`);
        ns.tprint("This script will ...");
        ns.tprint("      --dry       Log actions instead of make them.")
        ns.tprint("      --debug     Enable debug logging.");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    if (!args.debug) {
        ns.disableLog("ALL");
    }

    let hasSingularity:boolean;
    try {
        await ns.installBackdoor();
        hasSingularity = true;
    } catch (e) {
        hasSingularity = false;
    }

    scan(ns).filter(s=>!s.backdoorInstalled).filter(s=>!s.purchasedByPlayer).forEach(s=>{
        if (hasSingularity) {
            s.path.forEach(p=>{
                ns.connect(p);
            });
            ns.connect(s.hostname);
            ns.installBackdoor();
        } else {
            ns.tprint(s.path.filter(p=>p !== "home").reduce((a, b)=>`${a};connect ${b}`, "home") + `;connect ${s.hostname};backdoor`);
        }
    });
    

    ns.toast(`${ns.getScriptName()}`, "success");
}

export function autocomplete(data:any, args:any) {
    return [...data.servers, ...data.scripts, ...data.txts, "low", "medium", "high"];
}
