export const daemonOpts: [string, string | number | boolean | string[]][] = [
    ["o", false],
    ["once", false],
    ["t", false],
    ["toast", false],
    ["runs", Number.MAX_SAFE_INTEGER],
    ["sleep", 1000]
];

export const daemonOptsHelp =
    "\nDaemon options:\n" +
    "  -o, --once      Will execute one iteration then stop.\n" +
    "  -t, --toast     Toast completed daemon actions.\n" +
    "      --runs      Number of runs before killing daemon. (Default: infinite)\n" +
    "      --sleep     Refresh queue interval. (Default: 1,000ms)\n";

export function debugDaemonOpts(args: any) {
    let debugLog = "Daemon options:\n";
    debugLog += `  -o, --once     ${args.o}, ${args.once}\n`;
    debugLog += `  -t, --toast    ${args.t}, ${args.toast}\n`;
    debugLog += `      --runs     ${args.runs}\n`;
    debugLog += `      --sleep    ${args.sleep}\n`;
    return debugLog;
}

export function isAlive(args:{runs:number, once:boolean, o:boolean}):boolean {
    if (args.runs > 0) {
        if (args.once || args.o) {
            args.runs = 0;
            return true;
        }
        args.runs--;
        return true;
    }

    return false;
}