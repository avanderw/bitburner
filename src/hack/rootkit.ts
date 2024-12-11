import { NS } from "/bitburner/NetscriptDefinitions";
import { configDaemon, runDaemon, stopDaemon } from "/util/daemon";
import { scan } from "/hack/scan";
import { Config, startupScript } from "/util/script";
import { info } from "/log/in/api";

export async function main(ns: NS) {
    const config = configDaemon(ns, "Rooter", "Monitor and root servers.", []);
    startupScript(ns, config);
    await runDaemon(ns, config, daemon);
}

async function daemon(ns: NS, config: Config) {
    const crackers = validCrackers(ns);
    const servers = scan(ns)
        .filter(s => !ns.hasRootAccess(s.hostname))
        .filter(s => ns.getServerRequiredHackingLevel(s.hostname) <= ns.getHackingLevel())
        .filter(s => ns.getServerNumPortsRequired(s.hostname) <= crackers.length);

    for (const server of servers) {
        crackers.forEach(cracker => {
            cracker.call(null, server.hostname);
        });

        ns.nuke(server.hostname);

        await info(ns, config, "Server rooted.");
        ns.toast(`${ns.getScriptName()} ${server.hostname}`, "info");
    }

    if (scan(ns).filter(s=>!ns.hasRootAccess(s.hostname)).length === 0) {
        await info(ns, config, "All servers rooted. Stopping daemon.")
        stopDaemon(ns, config);
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
