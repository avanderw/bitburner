
import { NS } from "/lib/NetscriptDefinitions";

export function autocomplete(data: any) {
    return [...data.servers];
}

export function main(ns: NS): void {
    if (ns.args.length === 0) {
        ns.tprint("Usage: tracert <server>");
        return;
    }

    const hops = tracert(ns, ns.args[0] as string, "home", []);
    if (hops.length === 0) {
        ns.tprintf("Unable to resolve %s", ns.args[0] as string);
        return;
    }
    ns.tprintf(hops.reduce((a, b, i) => a + "\n" + " ".repeat(i) + "-> " + b, "home"));
}

function tracert(ns: NS, to: string, from: string, seen: string[]): string[] {
    if (seen.indexOf(from) !== -1) {
        return [];
    }
    seen = [...seen, from];
    const neighbours = ns.scan(from)
        .filter(s => seen.indexOf(s) === -1);
    for (const s of neighbours) {
        if (s === to) {
            return [s];
        }

        const rt = tracert(ns, to, s, seen);
        if (rt.length > 0) {
            return [s, ...rt];
        }
    };
    return [];
}
