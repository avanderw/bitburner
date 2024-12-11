import { NS } from "/bitburner/NetscriptDefinitions";
import { port } from "/metric/config";

async function write(ns: NS, type: string, metrics: { name: string; value: string | number }[]) {
    const timestamp = Math.round(new Date().getTime() / 1000) + "";
    const packets: Metric[] = [];
    metrics.forEach(metric => {
        packets.push({
            type: type,
            metric: metric.name,
            value: metric.value + "",
            measure_time: timestamp
        });
    });
    await ns.writePort(port, JSON.stringify(packets));
}

export async function gauge(ns: NS, name: string, value: string | number) {
    await write(ns, "gauge", [{ name: name, value: value }]);
}

export async function gaugeBatch(ns: NS, metrics: { name: string; value: string | number }[]) {
    await write(ns, "gauge", metrics);
}

export async function delta(ns: NS, name: string, value: string | number) {
    await write(ns, "delta", [{ name: name, value: value }]);
}

export async function cumulative(ns: NS, name: string, value: string | number) {
    await write(ns, "cumulative", [{ name: name, value: value }]);
}

export async function cumulativeBatch(ns: NS, metrics: { name: string; value: string | number }[]) {
    await write(ns, "cumulative", metrics);
}

export async function test(ns: NS, name: string, value: string | number) {
    await write(ns, "test", [{ name: name, value: value }]);
}
