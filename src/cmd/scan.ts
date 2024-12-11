import { NS } from "../bitburner/NetscriptDefinitions";
import { Server } from "../bitburner/CustomDefinitions";
import { scan } from "/util/scan";

export function autocomplete(data: any, args: any) {
    return [...data.servers, "security", "chance", "contract", "rooted"];
}

export async function main(ns: NS) {
    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    });
    const args = ns.flags([
        ["uuid4", ""],
        ["top", 3],
        ["reverse", false],
        ["r", false],
        ["sort", "money"],
        ["all", false],
        ["a", false],
        ["and", []],
        ["not", []],
        ["detail", false],
        ["debug", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h) {
        ns.tprint(`USAGE: run ${ns.getScriptName()}`);
        ns.tprint("Filter scannable servers.");
        ns.tprint("      --top       How many results to show. (default: 3)");
        ns.tprint("  -a, --all       Print all results.");
        ns.tprint("  -r, --reverse   Whether to reverse the order.");
        ns.tprint("      --sort      [money|security|ram|chance|mps]. (default: money)");
        ns.tprint("      --and       Filters <filter>. (default: [])");
        ns.tprint("      --or        Inclusions <filter>. (default: [])");
        ns.tprint("      --not       Exclusions <filter>. (default: [])");
        ns.tprint("      --detail    Display detail about the server. (default: false)");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        ns.tprint("");
        ns.tprint("Options");
        ns.tprint("  filter: [rooted|contract|owned|backdoor|prepped]");
        return;
    }
    if (!args.debug) {
        ns.disableLog("ALL");
    }

    let servers: Server[] = scan(ns);
    servers = filter(args, servers);
    servers = exclude(args, servers, ns);

    const SORT_FUNCS: { [name: string]: (a: Server, b: Server) => number } = {
        money: (a: Server, b: Server) => a.moneyMax - b.moneyMax,
        security: (a: Server, b: Server) => a.minDifficulty - b.minDifficulty,
        ram: (a: Server, b: Server) => a.maxRam - b.maxRam,
        chance: (a: Server, b: Server) => a.hackChance - b.hackChance,
        mps: (a: Server, b: Server) => moneyPerSecond(a, ns) - moneyPerSecond(b, ns),
        level: (a: Server, b: Server) => a.requiredHackingSkill - b.requiredHackingSkill
    };
    servers = servers.sort(SORT_FUNCS[args.sort]);
    if (!(args.reverse || args.r)) {
        servers = servers.reverse();
    }

    const TO_STRING_FUNCS: { [name: string]: (a: Server) => string } = {
        money: (a: Server) => currency.format(a.moneyAvailable),
        security: (a: Server) => number.format(a.hackDifficulty),
        ram: (a: Server) => number.format(a.maxRam),
        chance: (a: Server) => number.format(a.hackChance),
        mps: (a: Server) => `$${number.format(moneyPerSecond(a, ns)).padStart(7)}/s`,
        level: (a: Server) => number.format(a.requiredHackingSkill)
    };
    const limit = args.all || args.a ? servers.length : Math.min(servers.length, args.top);
    for (let i = 0; i < limit; i++) {
        ns.tprintf("[%2s] %20s (%s)", i + 1, servers[i].hostname, TO_STRING_FUNCS[args.sort](servers[i]));
        if (args.detail || args.debug) {
            ns.tprintf(JSON.stringify(servers[i], null, 2));
        }
    }
    ns.tprintf("Showing %s of %s", limit, servers.length);
}

function moneyPerSecond(server: Server, ns: NS): number {
    return (
        (ns.hackAnalyzeChance(server.hostname) *
            ns.hackAnalyze(server.hostname) *
            ns.getServerMoneyAvailable(server.hostname)) /
        ns.getHackTime(server.hostname)
    );
}

const AND: { [name: string]: (s: Server) => boolean } = {
    rooted: (s: Server) => s.hasAdminRights,
    contract: (s: Server) => s.files.filter(f => f.endsWith("cct")).length > 0,
    owned: (s: Server) => s.purchasedByPlayer,
    backdoor: (s: Server) => s.backdoorInstalled,
    prepped: (s: Server) => atMaxMoney(s) && atMinSecurity(s)
};
function filter(args: any, servers: Server[]): Server[] {
    let filtered: Server[] = [];
    filtered.push(...servers);
    for (let i = 0; i < args.and.length; i++) {
        const key = args.and[i];
        const find = AND.hasOwnProperty(key) ? AND[key] : (s: Server) => s.hostname.indexOf(key) !== -1;
        filtered = filtered.filter(find);
    }
    return filtered;
}

const NOT: { [name: string]: (s: Server) => boolean } = {
    rooted: (s: Server) => !s.hasAdminRights,
    owned: (s: Server) => !s.purchasedByPlayer,
    backdoor: (s: Server) => !s.backdoorInstalled,
    prepped: (s: Server) => !atMaxMoney(s) || !atMinSecurity(s)
};
function exclude(args: any, servers: Server[], ns: NS): Server[] {
    let filtered: Server[] = [];
    filtered.push(...servers);
    for (let i = 0; i < args.not.length; i++) {
        const key: string = args.not[i];
        let filter;
        if (NOT.hasOwnProperty(key)) {
            filter = NOT[key];
        } else {
            if (key.indexOf(":") === -1) {
                filter = (s: Server) => s.hostname.indexOf(key) === -1;
            } else {
                filter = (s: Server) => {
                    const value = key.substring(key.indexOf(":") + 1);
                    switch (key.substring(0, key.indexOf(":"))) {
                        case "mps":
                            return moneyPerSecond(s, ns).toString() !== value;
                        case "ram":
                            return s.maxRam.toString() !== value;
                        default:
                            return true;
                    }
                };
            }
        }
        filtered = filtered.filter(filter);
    }
    return filtered;
}

function atMaxMoney(s: Server): boolean {
    return s.moneyAvailable === s.moneyMax;
}

function atMinSecurity(s: Server): boolean {
    return s.hackDifficulty === s.minDifficulty;
}
