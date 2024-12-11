import { loki } from "/log/out/loki";
import { file } from "/log/out/file";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function save(ns: NS, logs: Logs) {
    try {
        await file(ns, logs);
    } catch {
        throw new Error("Warning not implemented");
    }
    try {
        loki(logs);
    } catch {
        throw new Error("Warning not implemented");
    }
}
