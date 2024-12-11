import { init } from "/cmd/util/init";
import { gauge } from "/port/out/graphite";
import { NS } from "../../bitburner/NetscriptDefinitions";
import { scan } from "/util/lite/scan";

export async function main(ns: NS) {
    init(ns, [], []);
    scan(ns).forEach(server => {
        gauge([
            {
                metric: ns.sprintf("servers.%s.money", server.hostname.replaceAll(".", "_")),
                value: ns.getServerMoneyAvailable(server.hostname)
            },
            {
                metric: ns.sprintf("servers.%s.security", server.hostname.replaceAll(".", "_")),
                value: ns.getServerSecurityLevel(server.hostname)
            },
            {
                metric: ns.sprintf("servers.%s.ram.free", server.hostname.replaceAll(".", "_")),
                value: ns.getServerMaxRam(server.hostname) - ns.getServerUsedRam(server.hostname)
            }
        ]);
    });
}
