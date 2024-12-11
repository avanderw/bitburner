import { debug, info, warn, error } from "../in/dispatcher";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    await debug(ns, "debug level test");
    await info(ns, "info level test");
    await warn(ns, "warn level test");
    await error(ns, "error level test");
}

