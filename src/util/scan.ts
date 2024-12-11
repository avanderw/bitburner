import { NS } from "../bitburner/NetscriptDefinitions";
import { FifoQueue } from "/lib/FifoQueue";
import { Server } from "../bitburner/CustomDefinitions";

export function scan(ns: NS): Server[] {
    const process = new FifoQueue<Server>();
    const visited: Server[] = [];
    process.enqueue({
        ...ns.getServer("home"),
        files: ns.ls("home"),
        hackChance: ns.hackAnalyzeChance("home"),
        path: [],
        hackTime: ns.getHackTime("home"),
        weakenTime: ns.getWeakenTime("home"),
        growTime: ns.getGrowTime("home"),
        toString: () => "home"
    });
    while (process.hasItems()) {
        const host: Server = process.dequeue();
        visited.push(host);

        const path: string[] = host.path.slice();
        path.push(host.hostname);

        const servers = ns.scan(host.hostname);
        for (let i = 0; i < servers.length; i++) {
            const server: Server = {
                ...ns.getServer(servers[i]),
                files: ns.ls(servers[i]),
                hackChance: ns.hackAnalyzeChance(servers[i]),
                path: path,
                hackTime: ns.getHackTime(servers[i]),
                weakenTime: ns.getWeakenTime(servers[i]),
                growTime: ns.getGrowTime(servers[i]),
                toString: () => servers[i]
            };

            if (visited.filter(s => s.hostname === server.hostname).length === 0 && !process.contains(server)) {
                process.enqueue(server);
            }
        }
    }
    return visited;
}
