/**
 * Reloader will trigger a reload of a daemon script when the source code changes.
 *
 * The original idea and code was shared on the official discord channel.
 * https://github.com/JohnnyQuazar/bitburner-scripts/blob/main/workbench.js
 *
 * Version 1: Initial release
 *
 * 0. Reload a script when the file contents change.
 * 1. Kill the existing script and start a new one.
 * 
 * MUST migrate to daemon
 */
export const version = "1.1-alpha";

import { NS } from "/lib/NetscriptDefinitions";

export async function main(ns: NS) {
    ns.disableLog("ALL");

    if (ns.args.length === 0) {
        ns.tprint("Usage: ./reloader.js <script> [scriptArgs...] --tail");
        return;
    }

    const scriptPath: string = ns.args[0] as string;
    const scriptArgs = ns.args.slice(1) as string[];
    const host = ns.getHostname();

    // Validate the arguments
    if (!ns.fileExists(scriptPath)) {
        ns.tprint("Script not found: " + scriptPath);
        return;
    }

    // Kill script if it is already running.
    const processes = ns.ps(host);
    processes.forEach(process => {
        if (process.filename === scriptPath) {
            ns.kill(process.pid);
        }
    });

    // Check for file changes and restart script if it has changed.
    let scriptPid: number = 0;
    let scriptChecksum: string = "";
    while (true) {
        if (ns.isRunning(scriptPath, host, ...scriptArgs)) {
            const newChecksum = checksum(ns.read(scriptPath).toString());
            if (newChecksum !== scriptChecksum) {
                ns.kill(scriptPid);
                scriptPid = ns.run(scriptPath, 1, ...scriptArgs);
                scriptChecksum = newChecksum;
            } else {
                ns.clearLog();
                ns.getScriptLogs(scriptPath, host, ...scriptArgs).forEach(log => {
                    ns.print(log);
                });
            }
        } else {
            scriptPid = ns.run(scriptPath, 1, ...scriptArgs);
            scriptChecksum = checksum(ns.read(scriptPath).toString());
        }

        await ns.sleep(100);
    }
}

// https://stackoverflow.com/questions/811195/fast-open-source-checksum-for-small-strings
function checksum(s: string): string {
    let chk = 0x12345678;
    const len = s.length;
    for (let i = 0; i < len; i++) {
        chk += s.charCodeAt(i) * (i + 1);
    }

    return (chk & 0xffffffff).toString(16);
}
