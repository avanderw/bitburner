import { NS } from "/bitburner/NetscriptDefinitions";
import { port } from "/log/config";

export async function main(ns: NS) {
    const logs: Logs = {
        streams: [
            {
                stream: {
                    host: ns.getHostname(),
                    filename: ns.getScriptName(),
                    level: "warn"
                },
                values: [[now(), "traceId=0423270388e8724e49ff29884a93f382 another message"]]
            }
        ]
    };
    await ns.writePort(port, JSON.stringify(logs));
}

function generateId(length: number): string {
    const characters = "abcdef0123456789";
    let result = "";
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function now(): number {
    return new Date().getTime() * 1000 * 1000;
}
