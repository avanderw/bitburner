import { NS } from "/bitburner/NetscriptDefinitions";
import { save } from "/log/service/save";
import { archive, lock, port } from "/log/config";
import { configDaemon, runDaemon } from "/util/daemon";
import { Config, startupScript } from "/util/script";
import { gauge } from "/metric/in/api";
import { info } from "/util/tail";

export async function main(ns: NS) {
    const config = configDaemon(ns, "Log", "A listener that batches and saves log packets written to its port.", [
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
    const packets: Logs = { streams: [] };
    let packet;
    while ((packet = ns.readPort(config.port)) !== "NULL PORT DATA") {
        packets.streams.push(...(JSON.parse(packet) as Logs).streams);
    }

    if (packets.streams.length > 0) {
        await save(ns, packets);
        info(ns, ns.sprintf("Saved %s packets", packets.streams.length + ""));
    }

    await gauge(ns, "log.listener.packets", packets.streams.length + "");
}
