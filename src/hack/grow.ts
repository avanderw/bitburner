
/**
 * SHOULD remove servers that are currently being grown
 */
import { NS } from "/lib/NetscriptDefinitions";

export function autocomplete(data: any) {
    return [...data.servers];
}

const PER_GROW_THREAD = "/hack/grow-thread.js";
const PER_GROW_SECURITY = 0.004;
const PER_WEAKEN_THREAD = "/hack/weaken-thread.js";
const PER_WEAKEN_SECURITY = 0.05;

export async function main(ns: NS): Promise<void> {
    if (ns.args.length === 0) {
        const servers = traverseNet(ns)
            .filter(s => ns.getServerSecurityLevel(s) === ns.getServerMinSecurityLevel(s))
            .filter(s => ns.hasRootAccess(s))
            .filter(s => ns.getServerMoneyAvailable(s) < ns.getServerMaxMoney(s))
            .filter(s => ns.hackAnalyzeChance(s) > 0.75)
            .map(s => ({
                server: s,
                action: "grow",
                take: ns.hackAnalyzeChance(s) * ns.getServerMaxMoney(s),
                time: ns.getWeakenTime(s), 
                takePerSec: ns.hackAnalyzeChance(s) * ns.getServerMaxMoney(s) / ns.getWeakenTime(s)
            }))
            .sort((a, b) => a.takePerSec - b.takePerSec)
            .reverse();
        ns.tprintf(formatTable(servers));
        ns.tprintf(`Growing ${servers.length} servers`);
        const useHome =  ns.getServerMaxRam("home") > Math.pow(2, 14);
        for (const server of servers) {
            await grow(ns, server.server, useHome);
        }
    } else {
        for (const server of ns.args) {
            await grow(ns, server as string, true);
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

async function grow(ns: NS, target: string, useHome: boolean) {
    if (ns.getServerMoneyAvailable(target) === ns.getServerMaxMoney(target)) {
        ns.print(`${target} is already fully grown`);
        return;
    }

    while (true) {
        const growMultiplier = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target);
        let remainingGrowThreads = Math.ceil(ns.growthAnalyze(target, growMultiplier));

        const hosts = traverseNet(ns)
            .filter(s => s !== "home" || useHome)
            .filter(s => ns.hasRootAccess(s))
            .filter(s => freeRAM(ns, s) > ns.getScriptRam(PER_WEAKEN_THREAD) + ns.getScriptRam(PER_GROW_THREAD))
            .sort((a, b) => freeRAM(ns, a) - freeRAM(ns, b)).reverse();
        for (const host of hosts) {
            const assignGrowThreads = calculateGrowThreads(ns, host, remainingGrowThreads);
            if (assignGrowThreads === 0) {
                continue;
            }
            const requiredWeakenThreads = Math.ceil(assignGrowThreads * PER_GROW_SECURITY / PER_WEAKEN_SECURITY);
            ns.scp(PER_WEAKEN_THREAD, host);
            ns.scp(PER_GROW_THREAD, host);
            ns.exec(PER_WEAKEN_THREAD, host, requiredWeakenThreads, target);
            ns.exec(PER_GROW_THREAD, host, assignGrowThreads, target);
            remainingGrowThreads -= assignGrowThreads;
            if (remainingGrowThreads <= 0) {
                break;
            }
        }

        if (remainingGrowThreads > 0) {
            ns.print(`WARN Not enough RAM to grow ${target}`);
            await ns.sleep(ns.getWeakenTime(target) + 500);
        }
        else {
            break;
        }
    }
}

function calculateGrowThreads(ns: NS, host: string, remainingGrowThreads: number): number {
    const PER_WEAKEN_RAM = ns.getScriptRam(PER_WEAKEN_THREAD);
    const PER_GROW_RAM = ns.getScriptRam(PER_GROW_THREAD);

    let assignGrowThreads = remainingGrowThreads;
    while (true) {
        const requiredWeakenThreads = Math.ceil(assignGrowThreads * PER_GROW_SECURITY / PER_WEAKEN_SECURITY);
        const requiredWeakenRam = requiredWeakenThreads * PER_WEAKEN_RAM;
        const requiredGrowRAM = assignGrowThreads * PER_GROW_RAM;
        const totalRequiredRAM = requiredWeakenRam + requiredGrowRAM;
        const freeRam = freeRAM(ns, host);

        if (totalRequiredRAM <= freeRam) {
            return assignGrowThreads;
        } else {
            assignGrowThreads -= 8;
        }

        if (assignGrowThreads <= 0) {
            return 0;
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