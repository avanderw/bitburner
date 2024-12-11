import { cumulative, delta, gauge, test } from "/metric/out/graphite";
import { file } from "/metric/out/file";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function save(ns: NS, metric: Metric[]) {
    try {
        await file(ns, metric);
    } catch {
        throw new Error("Warning not implemented");
    }
    try {
        gauge(metric.filter(m => m.type === "gauge"));
    } catch {
        throw new Error("Warning not implemented");
    }
    try {
        delta(metric.filter(m => m.type === "delta"));
    } catch {
        throw new Error("Warning not implemented");
    }
    try {
        cumulative(metric.filter(m => m.type === "cumulative"));
    } catch {
        throw new Error("Warning not implemented");
    }
    try {
        test(metric.filter(m => m.type === "test"));
    } catch {
        throw new Error("Warning not implemented");
    }
}
