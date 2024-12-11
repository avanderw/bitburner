import { NS } from "/bitburner/NetscriptDefinitions";
import { debug, error, info } from "/log/in/api";
import { generateB3 } from "/util/script";

export async function load(ns: NS, config: any, scripts: string[]) {
    const number = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2
    });

    const hostname = "home";
    await debug(ns, config, "ram.free=" + number.format(ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) + "GB");

    let outOfMemory = false;
    for (let script of scripts) {
        if (ns.ps(hostname).find(p => p.filename === script)) {
            await info(ns, config, ns.sprintf("↻ Running [%5sGB]: %s", number.format(ns.getScriptRam(script)), script));
        } else {
            const remainingRam = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname) - ns.getScriptRam(script);
            if (remainingRam > config.reserve && !outOfMemory) {
                if (ns.run(script, 1, `--b3=${generateB3(config)}`, config.debug ? "--debug" : "") === 0) {
                    await error(ns, config, `Could not run ${script}`);
                    ns.tail();
                }
                await info(
                    ns,
                    config,
                    ns.sprintf(
                        "↪ Loading [%5sGB]: %-32s ...%6sGB free",
                        number.format(ns.getScriptRam(script)),
                        script,
                        number.format(ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))
                    )
                );
            } else {
                await info(
                    ns,
                    config,
                    ns.sprintf("↩ Reserve [%5sGB]: %s", number.format(ns.getScriptRam(script)), script)
                );
                outOfMemory = true;
            }
        }
    }
}
