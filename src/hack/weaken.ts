/** 
 * COULD prevent multiple threads from targeting the same server
 * SHOULD be smarter with weaken times when targeting all servers
 */

import { NS } from "/lib/NetscriptDefinitions";

export function autocomplete(data: any) {
    return [...data.servers];
}

export async function main(ns: NS): Promise<void> {
    if (ns.args.length === 0) {
        const servers = traverseNet(ns)
            .filter(s => ns.getServerSecurityLevel(s) > ns.getServerMinSecurityLevel(s))
            .filter(s => ns.hasRootAccess(s))
            .map(s => ({
                server: s,
                action: "weaken",
                take: ns.hackAnalyzeChance(s) * ns.getServerMaxMoney(s),
                time: ns.getWeakenTime(s),
                takePerSec: ns.hackAnalyzeChance(s) * ns.getServerMaxMoney(s) / ns.getWeakenTime(s)
            })).sort((a, b) => a.takePerSec - b.takePerSec)
            .reverse();
        ns.tprintf(formatTable(servers));
        ns.tprintf(`Weakening ${servers.length} servers`);
        const useHome = ns.getServerMaxRam("home") > Math.pow(2, 13);
        for (const server of servers) {
            await weaken(ns, server.server, useHome);
        }
    } else {
        for (const server of ns.args) {
            await weaken(ns, server as string, true);
        }
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

function freeRAM(ns: NS, host: string): number {
    return ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
}

async function weaken(ns: NS, target: string, useHome: boolean) {
    const THREAD = "/hack/weaken-thread.js";

    while (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
        const hosts = traverseNet(ns)
            .filter(s => ns.hasRootAccess(s))
            .filter(s => freeRAM(ns, s) !== 0)
            .filter(s => s !== "home" || useHome)
            .sort((a, b) => freeRAM(ns, a) - freeRAM(ns, b)).reverse();
        const threadWeaken = ns.weakenAnalyze(1)
        const threadRAM = ns.getScriptRam(THREAD);
        const serverWeaken = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);

        let remainingThreads = Math.ceil(serverWeaken / threadWeaken);
        for (const host of hosts) {
            const remainingRAM = remainingThreads * threadRAM;
            let assignRAM = Math.min(freeRAM(ns, host), remainingRAM);
            let assignThreads = remainingThreads;
            if (assignRAM !== remainingRAM) {
                assignThreads = Math.floor(assignRAM / threadRAM);
            }
            if (assignThreads === 0) {
                continue;
            }

            ns.scp(THREAD, host);
            ns.exec(THREAD, host, assignThreads, target);
            remainingThreads -= assignThreads;

            if (remainingThreads === 0) {
                break;
            }
        }

        if (remainingThreads > 0) {
            ns.printf("WARN Not enough RAM to weaken %s by %d threads", target, remainingThreads);
            await ns.sleep(ns.getWeakenTime(target) + 500);
        } else {
            break;
        }
    }
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