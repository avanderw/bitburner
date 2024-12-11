import { NS } from "/lib/NetscriptDefinitions";

export function autocomplete(data: any) {
    return [...data.servers];
}

export async function main(ns: NS) {
    ns.clearLog();
    ns.disableLog("getServerUsedRam");
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getServerSecurityLevel");
    ns.disableLog("getServerMinSecurityLevel");
    ns.disableLog("scan");
    if (ns.args.length === 0) {
        const servers = traverseNet(ns)
            .filter(s => ns.getServerSecurityLevel(s) === ns.getServerMinSecurityLevel(s))
            .filter(s => ns.hasRootAccess(s))
            .filter(s => ns.getServerMaxMoney(s) > 0)
            .filter(s => ns.getServerMoneyAvailable(s) === ns.getServerMaxMoney(s))
            .filter(s => ns.hackAnalyzeChance(s) > 0.75)
            .map(s => ({
                server: s,
                action: "hack",
                take: ns.hackAnalyzeChance(s) * ns.getServerMaxMoney(s),
                time: ns.getWeakenTime(s),
                takePerSec: ns.hackAnalyzeChance(s) * ns.getServerMaxMoney(s) / ns.getWeakenTime(s)
            })).sort((a, b) => a.takePerSec - b.takePerSec);
        ns.tprintf(formatTable(servers));
        ns.tprintf(`Hacking ${servers.length} servers`);
        const useHome = ns.getServerMaxRam("home") > Math.pow(2, 14);
        for (const server of servers) {
            ns.print("Hacking " + server + " with " + ns.hackAnalyzeChance(server.server) * 100 + "% chance");
            hack(ns, server.server, useHome);
        }
    } else {
        for (const server of ns.args) {
            hack(ns, server as string, true);
        }
    }
}

function hack(ns: NS, target: string, useHome: boolean) {
    if (ns.getScriptRam("/hack/hack-daemon.js") > ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) {
        ns.printf("WARN Not enough RAM to run hack-daemon.js on home");
        return;
    }
    if (ns.isRunning("/hack/hack-daemon.js", "home", target) || ns.isRunning("/hack/hack-daemon.js", "home", target, "--use-home")) {
        ns.printf("WARN Already hacking " + target);
        return;
    }
    if (useHome) {
        ns.run("/hack/hack-daemon.js", 1, target, "--use-home");
    } else {
        ns.run("/hack/hack-daemon.js", 1, target);
    }
}

function traverseNet(ns: NS): string[] {
    const process = ["home"];
    const visited: string[] = [];
    while (process.length > 0) {
        const current = process.pop()!;
        const servers = ns.scan(current);
        for (const server of servers) {
            if (!visited.includes(server) && !process.includes(server)) {
                process.push(server);
            }
        }

        visited.push(current);
    }
    return visited;
}

function formatTable(obj: any[]): string {
    if (obj.length === 0) {
        return "";
    }
    const NUMBER_FORMAT = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const colums = Object.keys(obj[0]);
    const rows = obj.map(o => Object.values(o));
    const widths = colums.map((c, i) => Math.max(c.length, Math.max(...rows.map(r => typeof r[i] === 'number' ? NUMBER_FORMAT.format(r[i] as number).length : (r[i] as object).toString().length))));
    const borderTop = widths.map(w => "─".repeat(w)).join("─┬─");
    const header = colums.map((c, i) => c.padEnd(widths[i])).join(" │ ");
    const divider = widths.map(w => "─".repeat(w)).join("─┼─");
    const borderBottom = widths.map(w => "─".repeat(w)).join("─┴─");
    const body = rows.map(
        r => r.map(
            (v, i) => typeof v === 'number' ? NUMBER_FORMAT.format(v).padStart(widths[i]) : (v as object).toString().padEnd(widths[i])
        ).join(" │ ")
    ).join("\n");
    return borderTop + "\n" + header + "\n" + divider + "\n" + body + "\n" + borderBottom;
}