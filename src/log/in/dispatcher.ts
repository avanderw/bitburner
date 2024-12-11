import { port } from "/log/config";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function info(ns: NS, message: string) {
    await write(ns, message, "info");
}

export async function debug(ns: NS, message: string) {
    await write(ns, message, "debug");
}

export async function warn(ns: NS, message: string) {
    await write(ns, message, "warn");
}

export async function error(ns: NS, message: string) {
    await write(ns, message, "error");
}

async function write(ns: NS, message: string, level: string) {
    const logs: Logs = {
        streams: [
            {
                stream: {
                    host: ns.getHostname(),
                    filename: ns.getScriptName(),
                    level: level
                },
                values: [[now(), message]]
            }
        ]
    };
    await ns.writePort(port, JSON.stringify(logs));
}

function now(): number {
    return new Date().getTime() * 1000 * 1000;
}
