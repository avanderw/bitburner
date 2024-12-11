import { NS } from "/bitburner/NetscriptDefinitions";
import { FifoQueue } from "/lib/FifoQueue";

export function scan(ns: NS): ServerLite[] {
    const process = new FifoQueue<ServerLite>();
    const visited: ServerLite[] = [];
    process.enqueue({
        hostname: "home",
        path: [],
        toString: () => "home"
    });
    while (process.hasItems()) {
        const host: ServerLite = process.dequeue();
        visited.push(host);

        const path: string[] = host.path.slice();
        path.push(host.hostname);

        const servers = ns.scan(host.hostname);
        for (let i = 0; i < servers.length; i++) {
            const server: ServerLite = {
                hostname: servers[i],
                path: path,
                toString: () => servers[i]
            };

            if (visited.filter(s => s.hostname === server.hostname).length === 0 && !process.contains(server)) {
                process.enqueue(server);
            }
        }
    }
    return visited;
}

interface ServerLite {
    readonly hostname: string;
    readonly path: string[];
    toString(): string;
}
