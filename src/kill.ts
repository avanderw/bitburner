import { configScript, startupScript } from "./util/script";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const config = configScript(ns, "Kill", "Kill processes based on a filter", [
        { name: "host", help: "Host to search.", default: ns.getHostname() },
        { name: "script", help: "Script to filter.", default: "all" }
    ]);
    startupScript(ns, config);

    ns.ps(config.host)
        .filter(p => config.script === "all" || p.filename.indexOf(config.script) >= 0)
        .forEach(p => {
            ns.kill(p.pid);
            ns.tprintf("(%s) %s", p.filename);
        });
}
