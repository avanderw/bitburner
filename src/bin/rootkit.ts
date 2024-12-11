/**
 * Version 1: Initial release
 * 
 * 1. Scan and root all servers.
 * 2. Quit when all servers are rooted.
 * 3. Quit if the host max RAM is low.
 */
export const version = "1.3-alpha";

import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    const flags = ns.flags([["min-ram", 1024]]);
    while (true) {
        ns.clearLog();
        const crackers = validCrackers(ns);
        scan(ns)
        .filter(s => !ns.hasRootAccess(s))
        .filter(s => ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel())
        .filter(s => ns.getServerNumPortsRequired(s) <= crackers.length)
        .forEach(s => {
            crackers.forEach(cracker => {
                cracker.call(null, s);
            });
            ns.nuke(s);
        });

        const remaining = scan(ns).filter(s => !ns.hasRootAccess(s));
        if (remaining.length === 0 || ns.getServerMaxRam(ns.getHostname()) < flags["min-ram"]) {
            break;
        } else {
            ns.print(`${remaining.length} Waiting for root access...`);
            await ns.sleep(1000);
        }
    }
}

function validCrackers(ns: NS): ((host: string) => void)[] {
    const portCrackers = [
        { file: "BruteSSH.exe", function: ns.brutessh },
        { file: "FTPCrack.exe", function: ns.ftpcrack },
        { file: "relaySMTP.exe", function: ns.relaysmtp },
        { file: "HTTPWorm.exe", function: ns.httpworm },
        { file: "SQLInject.exe", function: ns.sqlinject }
    ];

    return portCrackers.filter(c => ns.fileExists(c.file, "home")).map(c => c.function);
}

function scan(ns: NS):string[] {
    const process:string[] = ["home"];
    const visited:string[] = [];

    while (process.length !== 0) {
        const host = process.shift()!;
        visited.push(host);

        const servers = ns.scan(host);
        for (const server of servers) {
            if (process.concat(visited).every(s => s !== server)) {
                process.push(server);
            }
        }
    }

    return visited;
}
