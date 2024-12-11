export const commonOpts: [string, string | number | boolean | string[]][] = [
    ["h", false],
    ["help", false],
    ["d", false],
    ["dry", false],
    ["debug", false]
];

export const commonOptsHelp =
    "\nCommon options:\n" +
    "  -h, --help      Show this help message and exit.\n" +
    "  -d, --dry       Log instead of make actions.\n" +
    "      --debug     Enable debug logging (auto tails).\n" +
    "      --tail      Open the tail window.\n";

export function debugCommonOpts(args: any) {
    let debugLog = "Common options:\n";
    debugLog += `  -h, --help     ${args.h}, ${args.help}\n`;
    debugLog += `  -d, --dry      ${args.d}, ${args.dry}\n`;
    debugLog += `      --debug    ${args.debug}\n`;
    return debugLog;
}
