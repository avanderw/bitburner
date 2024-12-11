import { NS } from "/bitburner/NetscriptDefinitions";
import { port } from "/trace/config";

export async function main(ns: NS) {
    const span: Span = {
        traceId: generateId(32),
        id: generateId(16),
        timestamp: now(),
        duration: 1000 * 1000,
        localEndpoint: { serviceName: ns.getScriptName(), ipv4: ns.getHostname() },
        name: "main",
        tags: { host: "//" + ns.getHostname() + "/", service: ns.getScriptName() }
    };
    await ns.writePort(port, JSON.stringify(span));
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
    return new Date().getTime() * 1000;
}
