import { NS } from "/bitburner/NetscriptDefinitions";
import { configScript, startupScript } from "/util/script";
import { trace } from "/trace/in/api";
import { debug } from "/log/in/api";

export async function main(ns: NS) {
    const start = new Date().getTime();
    const config = configScript(ns, "Hack", "Hack the target server.", [
        { name: "target", help: "Target for the hack.", default: ns.getHostname() }
    ]);

    startupScript(ns, config);

    await ns.hack(config.target);
    await debug(ns, config, "Finished hack.")
    trace(ns, config.traceId, config.spanId, config.target, start, new Date().getTime() - start, config.parentId);
;
}
