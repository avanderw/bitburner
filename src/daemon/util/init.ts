import { commonDebug, commonFlags, commonHelp, customDebug, customFlags, customHelp } from "/cmd/util/help";
import { ScriptOption } from "../../bitburner/CustomDefinitions";
import { NS } from "../../bitburner/NetscriptDefinitions";

export function init(ns: NS, description: string[], options: ScriptOption[]): any {
    let help = customHelp(ns, description, options);
    help += commonHelp;
    help +=
        "\nDaemon options:\n" +
        "  -o, --once         Will execute one iteration then stop.\n" +
        "  -t, --toast        Toast completed daemon actions.\n" +
        "      --runs         Number of runs before killing daemon. (Default: infinite)\n" +
        "      --sleep        Refresh queue interval. (Default: 1,000ms)\n";

    const flags: [string, string | number | boolean | string[]][] = customFlags(options);
    flags.push(...commonFlags);
    flags.push(
        ["o", false],
        ["once", false],
        ["t", false],
        ["toast", false],
        ["runs", Number.MAX_SAFE_INTEGER],
        ["sleep", 1000]
    );

    const args = ns.flags(flags);
    if (args.debug) {
        let debugLog = customDebug(args, options);
        debugLog += commonDebug(args);
        debugLog += "\nDaemon options:\n";
        debugLog += `  -o, --once        ${args.o}, ${args.once}\n`;
        debugLog += `  -t, --toast       ${args.t}, ${args.toast}\n`;
        debugLog += `      --runs        ${args.runs}\n`;
        debugLog += `      --sleep       ${args.sleep}\n`;
        ns.print(debugLog);
    } else {
        ns.disableLog("ALL");
    }

    if (args.help || args.h) {
        ns.tprintf(help);
        args.init = false;
    } else {
        args.init = true;
    }

    if (args.dry) {
        ns.tail();
    }
    
    return args;
}