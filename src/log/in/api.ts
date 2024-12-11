import { NS } from "/bitburner/NetscriptDefinitions";
import { debug as d, error as e, info as i, warn as w } from "/log/in/dispatcher";

export async function debug(ns: NS, config: any, message: string) {
    ns.print(`${now()}: [DEBUG] ${message}`);
    await d(ns, markup(config, message));
}

export async function info(ns: NS, config: any, message: string) {
    ns.print(`${now()}: [INFO] ${message}`);
    await i(ns, markup(config, message));
}

export async function warn(ns: NS, config: any, message: string) {
    ns.print(`${now()}: [WARN] ${message}`);
    await w(ns, markup(config, message));
}

export async function error(ns: NS, config: any, message: string) {
    ns.print(`${now()}: [ERROR] ${message}`);
    await e(ns, markup(config, message));
}

function now(mod: number = 0) {
    const iso = new Date(new Date().getTime() + mod).toISOString();
    return iso.slice(11, iso.indexOf("Z"));
}

function markup(config: any, message: string): string {
    let m = "";
    if (config.traceId) {
        m += `traceId=${config.traceId} `;
    }
    if (config.target) {
        m += `target=${config.target} `;
    }
    m += message;
    return m;
}
