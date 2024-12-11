import { NS } from "/bitburner/NetscriptDefinitions";
import { save } from "/trace/service/save";
import { archive, lock, port } from "/trace/config";
import { configDaemon, runDaemon } from "/util/daemon";
import { Config, startupScript } from "/util/script";
import { gauge } from "/metric/in/api";
import { info } from "/util/tail";

export async function main(ns: NS) {
    const config = configDaemon(ns, "Trace", "A listener that batches and saves trace packets written to its port.", [
        { name: "port", help: "Listening port.", default: port }
    ]);
    startupScript(ns, config);

    if (ns.fileExists(lock) && ns.read(lock) !== ns.getScriptName()) {
        throw new Error("Port is locked!");
    }
    await ns.write(lock, ns.getScriptName(), "w");
    await runDaemon(ns, config, portListener);
}

async function portListener(ns: NS, config: Config) {
    const packets: Span[] = [];
    let packet;
    while ((packet = ns.readPort(config.port)) !== "NULL PORT DATA") {
        packets.push(JSON.parse(packet));
    }

    if (packets.length > 0) {
        await save(ns, packets);
        info(ns, ns.sprintf("Saved %s packets", packets.length + ""));
    }

    await gauge(ns, "trace.listener.packets", packets.length + "");
}
