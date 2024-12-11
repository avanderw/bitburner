import { NS } from "./bitburner/NetscriptDefinitions";
import { uuid4 } from "/lib/uuid4";

export async function main(ns: NS) {
    const DAEMON = "daemon-hack.js";
    const args = ns.flags([
        ["uuid4", ""],
        ["memory", -1],
        ["threads", -1],
        ["host", "home"],
        ["dry", false],
        ["debug", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args._.length < 1) {
        ns.tprint(`USAGE: run ${ns.getScriptName()} <target> [--host]`);
        ns.tprint("This script will setup the hack daemon.");
        ns.tprint("      <target>    Server to hack.");
        ns.tprint("      --host      Host for the daemon. (default: home)");
        ns.tprint("      --memory    Max memory to consume on host. (default: max)");
        ns.tprint("      --threads   Thread count per process. (default: max)");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    const host = args.host;
    const freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
    const memoryLimit = args.memory === -1 ? freeRam : Math.min(args.memory, freeRam);
    if (args.debug) {
        ns.tprint(`             host: ${host}`);
        ns.tprint(`          freeRam: ${freeRam}`);
        ns.tprint(`      memoryLimit: ${memoryLimit}`);
    }

    if (host !== "home") {
        await ns.scp(DAEMON, "home", host);
    }

    const scriptRam = ns.getScriptRam(DAEMON, host);
    const batchSize = args.threads === -1 ? Math.floor(memoryLimit / scriptRam) : args.threads;
    const batchRam = batchSize * scriptRam;
    const batchCount = Math.floor(memoryLimit / batchRam);
    if (args.debug) {
        ns.tprint(`           script: ${DAEMON}`);
        ns.tprint(`        scriptRam: ${scriptRam}`);
        ns.tprint(`        batchSize: ${batchSize}`);
        ns.tprint(`         batchRam: ${batchRam}`);
        ns.tprint(`       batchCount: ${batchCount}`);
    }

    const target = args._[0] as string;
    const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
    const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;
    if (args.debug) {
        ns.tprint(`           target: ${target}`);
        ns.tprint(`   moneyThreshold: ${moneyThreshold}`);
        ns.tprint(`securityThreshold: ${securityThreshold}`);
    }

    if (args.dry) {
        ns.tprint(`run ${DAEMON} -t ${batchSize} ${target} ${moneyThreshold} ${securityThreshold}`);
        return;
    } else {
        for (let i = 0; i < batchCount; i++) {
            ns.exec(`${DAEMON}`, host, batchSize, target, moneyThreshold, securityThreshold, "--uuid4", uuid4());
        }
    }
}

export function autocomplete(data:any, args:any) {
    return [...data.servers];
}