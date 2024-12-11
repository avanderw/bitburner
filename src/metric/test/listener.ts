import { NS } from "/bitburner/NetscriptDefinitions";
import { port } from "/metric/config";

export async function main(ns: NS) {
    const metric: Metric = {
        type: "test",
        metric: "random",
        value: Math.random() * 5 + "",
        measure_time: Math.round(new Date().getTime() / 1000) + ""
    };
    await ns.writePort(port, JSON.stringify(metric));
}
