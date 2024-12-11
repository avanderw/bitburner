/**
 * Version 1: Initial release
 * 0. Scan all servers.
 */
export const version = "1.0-alpha";

import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const process:string[] = [];
    const visited: string[] = [];
    process.push("home");

    while (process.length !== 0) {
        const host: string = process.shift()!;
        visited.push(host);
        const servers = ns.scan(host);
        for (const server of servers) {
            if (!visited.includes(server) && !process.includes(server)) {
                process.push(server);
            }
        }
    }

    ns.tprint(visited.join("\n"));
}