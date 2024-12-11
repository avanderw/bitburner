import { trace } from "/trace/in/api";
import { NS } from "/bitburner/NetscriptDefinitions";
import { debug } from "../../log/in/dispatcher";

export async function main(ns: NS) {
    const traceId = generateId(32);
    const id = generateId(16);
    await debug(ns, "traceId="+traceId+" Test linking to the trace.");
    await trace(ns, traceId, id, "test-parent", new Date().getTime(), 1000);
    await ns.sleep(200);
    await trace(ns, traceId, generateId(16), "test-child", new Date().getTime(), 200, id);
}

function generateId(length: number): string {
    const characters = "abcdef0123456789";
    let result = "";
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}