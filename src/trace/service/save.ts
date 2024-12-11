import { zipkin } from "trace/out/zipkin";
import { file } from "/trace/out/file";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function save(ns: NS, spans: Span[]) {
    try {
        await file(ns, spans);
    } catch {
        throw new Error("Warning not implemented");
    }
    try {
        zipkin(spans);
    } catch {
        throw new Error("Warning not implemented");
    }
}
