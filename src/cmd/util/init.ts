import { commonDebug, commonFlags, commonHelp, customDebug, customFlags, customHelp } from "/cmd/util/help";
import { ScriptOption } from "../../bitburner/CustomDefinitions";
import { NS } from "../../bitburner/NetscriptDefinitions";

export function init(ns: NS, description: string[], options: ScriptOption[]): any {
    let help = customHelp(ns, description, options);
    help += commonHelp;

    const flags: [string, string | number | boolean | string[]][] = customFlags(options);
    flags.push(...commonFlags);

    const args = ns.flags(flags);
    if (args.debug) {
        let debugLog = customDebug(args, options);
        debugLog += commonDebug(args);
        ns.print(debugLog);
    } else {
        ns.disableLog("ALL");
    }

    if (args.help || args.h) {
        ns.tprintf(help);
        ns.exit();
    }
    
    return args;
}
