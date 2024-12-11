import { NS } from "/lib/NetscriptDefinitions";

export function autocomplete(data: any) {
    return [...data.servers];
}

export async function main(ns: NS) {
    const crackers = validCrackers(ns);
    const targets = traverseNet(ns).filter(s => !ns.hasRootAccess(s))
        .filter(s => ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel())
        .filter(s => ns.getServerNumPortsRequired(s) <= crackers.length);
    targets.forEach(s => {
            crackers.forEach(crack => {
                crack(s);
            });

            ns.nuke(s);
        });
    ns.tprintf(`Hacked ${targets.length} servers`);
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