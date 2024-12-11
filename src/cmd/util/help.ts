import { ScriptOption } from "../../bitburner/CustomDefinitions";
import { NS } from "../../bitburner/NetscriptDefinitions";

export const commonHelp =
    "\nCommon options:\n" +
    "      --parent       Program that spawned this script.\n" +
    "      --start        Time the script was started.\n" +
    "      --correlation  Correlation ID to trace thread tree."
    "  -h, --help         Show this help message and exit.\n" +
    "  -d, --dry          Log instead of make actions.\n" +
    "      --debug        Enable debug logging (auto tails).\n" +
    "      --tail         Open the tail window.\n";

export const commonFlags: [string, string | number | boolean | string[]][] = [
    ["h", false],
    ["help", false],
    ["d", false],
    ["dry", false],
    ["debug", false],
    ["parent", "terminal"],
    ["correlation", "n/a"],
    ["start", now()]
];

export function commonDebug(args: any): string {
    let debugLog = "\nCommon options:\n";
    debugLog += `  -h, --help        ${args.h}, ${args.help}\n`;
    debugLog += `  -d, --dry         ${args.d}, ${args.dry}\n`;
    debugLog += `      --debug       ${args.debug}\n`;
    return debugLog;
}

export function customHelp(ns: NS, description: string[], options: ScriptOption[]): string {
    let help = "\n";
    help += `      Usage: .${ns.getScriptName()}\n`;
    help += `Description: ${description[0]}\n`;
    for (let i = 1; i < description.length; i++) {
        help += `             ${description[i]}\n`;
    }
    if (options.length !== 0) {
        help += "\nOptions:\n";
        options.forEach(opt => {
            if (opt.shortDesc === undefined) {
                help += `      --${opt.option.padEnd(12)}${opt.desc} (Default: ${opt.default})\n`;
            } else {
                help += `  -${opt.shortDesc}, --${opt.option.padEnd(12)}${opt.desc} (Default: ${opt.default})\n`;
            }
        });
    }
    return help;
}

export function customFlags(options: ScriptOption[]): [string, string | number | boolean | string[]][] {
    const flags: [string, string | number | boolean | string[]][] = [];
    if (options.length !== 0) {
        options.forEach(opt => {
            if (opt.shortDesc !== undefined) {
                flags.push([opt.shortDesc, opt.default]);
            }
            flags.push([opt.option, opt.default]);
        });
    }
    return flags;
}

export function customDebug(args: any, options: ScriptOption[]): string {
    let debugLog = "\n";
    if (options.length !== 0) {
        debugLog += "\nOptions:\n";
        options.forEach(opt => {
            if (opt.shortDesc === undefined) {
                debugLog += `      --${opt.option.padEnd(12)}${args[opt.option]}\n`;
            } else {
                debugLog += `  -${opt.shortDesc}, --${opt.option.padEnd(12)}${args[opt.shortDesc]}, ${args[opt.option]})\n`;
            }
        });
    }
    return debugLog;
}


/**
 * Utility function for time.
 * @returns hh:mm:ss
 */
 function now(mod:number = 0) {
    const iso = new Date(new Date().getTime() + mod).toISOString();
    return iso.slice(11, iso.indexOf("Z"));
}