/**
 * MUST migrate from /sbin/reloader to daemon
 */

import { NS } from "/lib/NetscriptDefinitions";

export async function main(ns: NS): Promise<void> {
    const [script, delay] = ns.args;

    if (!script) {
        ns.tprint("Usage: daemon <script> [delay]");
        return;
    }

    if (!delay) {
        ns.tprint("No delay specified, using 1 second");
    }

    const delayMs = (delay as number || 1) * 1000;
    while (true) {
        ns.run(script as string);
        await ns.sleep(delayMs);
    }
}