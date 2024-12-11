import {NS} from "/lib/NetscriptDefinitions";

export const release = {
    "version": "1.2-beta",
    "description": "Scan servers.",
    "log": [
        "1.0 Scan for all servers", 
        "1.1 Grow and weaken status",
        "1.2 Use eval to reduce RAM usage"
    ]
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});

export async function main(ns: NS) {
    ns.clearLog();
    ns.disableLog("ALL");

    const visited = visit(ns).sort();    
    const maxVisited = Math.max(...visited.map(server => server.length));
    for (const server of visited) {
        let status;
        if (eval('ns.hasRootAccess(server)')) {
            status = "🟢";
        } else if (eval('ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()')) {
            status = "🔴";
        } else if (eval('ns.getServerNumPortsRequired(server)') > validCrackers(ns).length) {
            status = "🔴";
        } else {
            status = "🟡";
        }
        

        let out = `[${NUMBER_FORMAT.format(eval('ns.getServerMaxRam(server)')).padStart(10)}GB] ${status} ${server.padEnd(maxVisited)}`;
        out += eval('ns.getServerMoneyAvailable(server) !== ns.getServerMaxMoney(server)') ? "  " : " 💰";
        out += eval('ns.getServerSecurityLevel(server) !== ns.getServerMinSecurityLevel(server)') ? "  " : " 🔒";

        ns.print(out);
    }
    ns.tail();
}

function visit(ns:NS):string[] {
    const process = ["home"];
    const visited:string[] = [];
    while (process.length > 0) {
        const current = process.pop()!;
        const servers = eval('ns.scan(current)');
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

    return portCrackers.filter(c => eval('ns.fileExists(c.file, "home")')).map(c => c.function);
}