import { NS } from "/bitburner/NetscriptDefinitions";
import { save } from "/metric/service/save";
import { archive, lock, port } from "/metric/config";
import { configDaemon, runDaemon } from "/util/daemon";
import { Config, startupScript } from "/util/script";
import { info } from "/util/tail";

export async function main(ns: NS) {
    const config = configDaemon(ns, "Metric", "A listener that batches and saves metric packets written to its port.", [
        { name: "port", help: "Listening port.", default: port }
    ]);
    startupScript(ns, config);

    if (ns.fileExists(lock) && ns.read(lock) !== ns.getScriptName()) {
        throw new Error("Port is locked!");
    }
    await ns.write(lock, ns.getScriptName(), "w");

    ns.rm(archive);
    await runDaemon(ns, config, portListener);
}

async function portListener(ns: NS, config: Config) {
    const packets: Metric[] = [];
    let numPackets = 0;
    let packet;
    while ((packet = ns.readPort(config.port)) !== "NULL PORT DATA") {
        numPackets++;
        packets.push(...(JSON.parse(packet) as Metric[]));
    }

    info(ns, ns.sprintf("Saving %s packet(s)", numPackets + ""));
    packets.push({
        type: "gauge",
        metric: "metric.listener.packets",
        value: numPackets + "",
        measure_time: Math.round(new Date().getTime() / 1000) + ""
    });
    await save(ns, packets);
}
