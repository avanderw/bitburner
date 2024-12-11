import { load } from "/boot/loader";
import { NS } from "/bitburner/NetscriptDefinitions";
import { configScript, startupScript } from "/util/script";
import { trace } from "/trace/in/api";

export async function main(ns: NS) {
    const start = new Date().getTime();
    const config = configScript(ns, "Monitor", "Load daemon threads.", [
        { name: "reserve", help: "Keep this RAM available.", default: 16 }
    ]);
    startupScript(ns, config);

    const scripts = [
        "/hack/rootkit.js",
        "/hack/scheduler.js"
    ];

    await load(ns, config, scripts);
    await trace(ns, config.traceId, config.spanId, "daemon", start, new Date().getTime() - start, config.parentId);
}
