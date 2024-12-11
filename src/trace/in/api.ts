import { NS } from "/bitburner/NetscriptDefinitions";
import { debug } from "../../log/in/api";
import { port } from "/trace/config";

export async function trace(
    ns: NS,
    traceId: string,
    id: string,
    action: string,
    start: number,
    duration: number,
    parentId?: string
) {
    const span: Span = {
        traceId: traceId,
        id: id,
        timestamp: start * 1000,
        duration: duration * 1000,
        localEndpoint: { serviceName: ns.getScriptName(), ipv4: ns.getHostname() },
        name: action,
        tags: { host: "//" + ns.getHostname() + "/", service: ns.getScriptName() }
    };

    if (parentId !== undefined) {
        span.parentId = parentId;
    }
    
    await ns.writePort(port, JSON.stringify(span));
}

