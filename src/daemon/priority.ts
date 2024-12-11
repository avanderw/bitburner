import { PriorityQueue } from "/lib/PrioirityQueue";
import { Queue } from "/lib/Queue";
import { Server } from "../bitburner/CustomDefinitions";
import { NS } from "../bitburner/NetscriptDefinitions";
import { daemonOpts, daemonOptsHelp, debugDaemonOpts } from "./util";
import { scan } from "/util/scan";
import { commonOpts, commonOptsHelp, debugCommonOpts } from "../util/options";
import { Port } from "/type/CustomEnums";

export async function main(ns: NS) {
    const help =
        `Usage: run ${ns.getScriptName()}\n` +
        "Refresh job queues with priority hacks.\n" +
        daemonOptsHelp +
        commonOptsHelp;

    const flags: [string, string | number | boolean | string[]][] = [];
    flags.push(...daemonOpts);
    flags.push(...commonOpts);

    const args = ns.flags(flags);
    if (args.debug) {
        ns.disableLog("getServerMoneyAvailable");
        ns.disableLog("scan");
        ns.tail();
        ns.print(debugDaemonOpts(args));
        ns.print(debugCommonOpts(args));
    } else {
        ns.disableLog("ALL");
    }

    if (args.help || args.h) {
        ns.tprintf(help);
        return;
    }

    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    });

    /** Focus on servers that generate the most money/s */
    const hackQueue: Queue<Server> = new PriorityQueue<Server>((a, b) => mps(a, ns) - mps(b, ns), true);
    /** Focus on servers that require the most weakening */
    const weakenQueue: Queue<Server> = new PriorityQueue<Server>((a, b) => deltaDiff(a, ns) - deltaDiff(b, ns), true);
    /** Focus on server that require the most growing */
    const growQueue: Queue<Server> = new PriorityQueue<Server>((a, b) => deltaMoney(a, ns) - deltaMoney(b, ns), true);

    let running = true;
    while (running) {
        scan(ns)
            .filter(s => s.hasAdminRights)
            .filter(s => s.hostname !== "home")
            .filter(s => s.moneyMax !== 0)
            .forEach(server => {
                hackQueue.enqueue(server);
                weakenQueue.enqueue(server);
                growQueue.enqueue(server);
            });
            
        if (args.debug) {
            ns.print(ns.sprintf("     Best hack: %s", currency.format(mps(hackQueue.peek(), ns))));
            ns.print(ns.sprintf("Largest weaken: %s", "" + deltaDiff(weakenQueue.peek(), ns)));
            ns.print(ns.sprintf("  Largest grow: %s", "" + deltaMoney(growQueue.peek(), ns)));
        }

        if (args.dry) {
            ns.tprintf("Write port %2s with [%s]", Port.hack, hackQueue);
            ns.tprintf("Write port %2s with [%s]", Port.weaken, weakenQueue);
            ns.tprintf("Write port %2s with [%s]", Port.grow, growQueue);
        } else {
            await refreshPort(Port.hack, hackQueue, ns);
            await refreshPort(Port.weaken, weakenQueue, ns);
            await refreshPort(Port.grow, growQueue, ns);
        }

        if (args.once || args.o) {
            running = false;
        }
        await ns.sleep(args.sleep);
    }
}

async function refreshPort(port: number, queue: Queue<Server>, ns: NS) {
    ns.clearPort(port);
    while (queue.hasItems()) {
        // ns.print(ns.sprintf("writePort(%s, %s)", "" + port, "" + queue.peek().hostname));
        await ns.writePort(port, queue.dequeue().hostname);
    }
}

function mps(server: Server, ns: NS): number {
    return (
        (ns.hackAnalyzeChance(server.hostname) *
            ns.hackAnalyze(server.hostname) *
            ns.getServerMoneyAvailable(server.hostname)) /
        ns.getHackTime(server.hostname)
    );
}

function deltaDiff(server: Server, ns: NS): number {
    return server.hackDifficulty - server.minDifficulty;
}

function deltaMoney(server: Server, ns: NS): number {
    return server.moneyMax - server.moneyAvailable;
}
