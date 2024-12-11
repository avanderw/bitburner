import { NS, ProcessInfo } from "./bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    });
    const args = ns.flags([
        ["uuid4", ""],
        ["a", false],
        ["all", false],
        ["top", 3],
        ["sort", "pid"],
        ["reverse", false],
        ["debug", false],
        ["dry", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h) {
        ns.tprint(`USAGE: run ${ns.getScriptName()} [host]`);
        ns.tprint("This script will ...");
        ns.tprint("      [host]      Host to query. (default: home)");
        ns.tprint("      --uuid4     Unique ID for the script.");
        ns.tprint("      --sort      [income|xp|ram|pid] sort. (default: pid)");
        ns.print("   -r, --reverse   Reverse the sort.");
        ns.tprint("      --dry       Log actions instead of make them.");
        ns.tprint("      --debug     Enable debug logging.");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    if (!args.debug) {
        ns.disableLog("ALL");
    }

    const host = args._[0] || "home";
    const scripts: Script[] = [];
    ns.ps(host).forEach(s => {
        scripts.push({
            ...s,
            income: ns.getScriptIncome(s.filename, host, ...s.args),
            xp: ns.getScriptExpGain(s.filename, host, ...s.args),
            ram: ns.getScriptRam(s.filename, host)
        });
    });

    const SORT_FUNCS: { [name: string]: (a: Script, b: Script) => number } = {
        income: (a, b) => b.income! - a.income!,
        xp: (a, b) => b.xp! - a.xp!,
        ram: (a, b) => b.ram! - a.ram!,
        pid: (a, b) => b.pid - a.pid
    };
    scripts.sort(SORT_FUNCS[args.sort]);
    if (args.reverse) {
        scripts.reverse();
    }

    const TO_STRING_FUNCS: { [name: string]: (s: Script, t: number) => string } = {
        income: s => currency.format(s.income!),
        xp: s => number.format(s.xp!),
        ram: (s, t) => number.format(s.ram! * t) + "GB",
        pid: s => ""
    };
    const top = (args.a || args.all) ? scripts.length : Math.min(args.top, scripts.length);
    for (let i = 0; i < top; i++) {
        const script = scripts[i];
        ns.tprintf(
            "%9s [%4s:%4s] %s %s",
            TO_STRING_FUNCS[args.sort](script, script.threads),
            script.pid,
            script.threads,
            script.filename,
            script.args
        );
    }
    ns.tprintf("Showing %s of %s", top, scripts.length);

    ns.toast(`${ns.getScriptName()}`, "success");
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}

interface Script extends ProcessInfo {
    income: number;
    xp: number;
    ram: number;
}
