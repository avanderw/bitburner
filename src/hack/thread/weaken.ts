import { NS } from "/bitburner/NetscriptDefinitions";
import { configScript, startupScript } from "/util/script";
import { trace } from "/trace/in/api";
import { debug } from "/log/in/api";

export async function main(ns: NS) {
    const start = new Date().getTime();
    const config = configScript(ns, "Weaken", "Weaken the target server.", [
        { name: "target", help: "Target for the weaken.", default: ns.getHostname() }
    ]);

    startupScript(ns, config);

    await ns.weaken(config.target);
    await debug(ns, config, "Finished weaken.")
    await trace(ns, config.traceId, config.spanId, config.target, start, new Date().getTime() - start, config.parentId);
}
