import { NS } from "/bitburner/NetscriptDefinitions";

export function debug(ns: NS, args: { debug: boolean }, message: string) {
    if (args.debug) {
        ns.print(`${now()}: [DEBUG] ${message}`);
    }
}

export function info(ns: NS, message: string) {
    ns.print(`${now()}: [INFO] ${message}`);
}

export function warn(ns: NS, message: string) {
    ns.print(`${now()}: [WARN] ${message}`);
}

export function error(ns: NS, message: string) {
    ns.print(`${now()}: [ERROR] ${message}`);
}

export function now(mod: number = 0) {
    const iso = new Date(new Date().getTime() + mod).toISOString();
    return iso.slice(11, iso.indexOf("Z"));
}
