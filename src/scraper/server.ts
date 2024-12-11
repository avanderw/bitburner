import { NS } from "/bitburner/NetscriptDefinitions";
import { gaugeBatch } from "/metric/in/api";
import { configDaemon, runDaemon } from "/util/daemon";
import { scan } from "/util/lite/scan";
import { Config, startupScript } from "/util/script";

export async function main(ns: NS) {
    const config = configDaemon(ns, "Server", "Scrape scanned server metrics.", []);
    startupScript(ns, config);
    await runDaemon(ns, config, scrape);
}

async function scrape(ns: NS, config: Config) {
    const servers = scan(ns);
    const batch: { name: string; value: string | number }[] = [];
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];
        batch.push(
            {
                name: ns.sprintf("server.%s.money.available", server.hostname),
                value: ns.getServerMoneyAvailable(server.hostname) + ""
            },
            {
                name: ns.sprintf("server.%s.money.max", server.hostname),
                value: ns.getServerMaxMoney(server.hostname) + ""
            },
            {
                name: ns.sprintf("server.%s.security.level", server.hostname),
                value: ns.getServerSecurityLevel(server.hostname) + ""
            },
            {
                name: ns.sprintf("server.%s.security.min", server.hostname),
                value: ns.getServerMinSecurityLevel(server.hostname)
            },
            {
                name: ns.sprintf("server.%s.ram.max", server.hostname),
                value: ns.getServerMaxRam(server.hostname)
            },
            {
                name: ns.sprintf("server.%s.ram.used", server.hostname),
                value: ns.getServerUsedRam(server.hostname) + ""
            },
            {
                name: ns.sprintf("server.%s.rooted", server.hostname),
                value: ns.hasRootAccess(server.hostname) ? 1 : 0
            },
            {
                name: ns.sprintf("server.%s.ready", server.hostname),
                value:
                    ns.getServerSecurityLevel(server.hostname) === ns.getServerMinSecurityLevel(server.hostname) &&
                    ns.getServerMaxMoney(server.hostname) === ns.getServerMoneyAvailable(server.hostname)
                        ? 1
                        : 0
            },
            {
                name: ns.sprintf("server.%s.processes", server.hostname),
                value: ns.ps(server.hostname).length
            }
        );
    }
    await gaugeBatch(ns, batch);
}
