import { NS, Player, Server } from "./bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    const args = ns.flags([
        ["uuid4", ""],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h || args._.length < 1) {
        ns.tprint(`USAGE: run ${ns.getScriptName()} <host>`);
        ns.tprint("Investigate hack statistics for a target.");
        ns.tprint("      <target>    Server to analyze.");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    const host = args._[0];
    const player:Player = ns.getPlayer();
    const threads:number = 0;
    const server:Server = ns.getServer(host);

    const cores = 2; 
    if (ns.fileExists("Formulas.exe", "home")) {
        ns.formulas.hacking.growPercent(server, threads, player, cores);
        ns.formulas.hacking.growTime(server, player);
        ns.formulas.hacking.hackChance(server, player);
        ns.formulas.hacking.hackExp(server, player);
        ns.formulas.hacking.hackPercent(server, player);
        ns.formulas.hacking.hackTime(server, player);
        ns.formulas.hacking.weakenTime(server, player);
    } else {
        ns.tprint("Must purchase Formulas.exe from the DarkWeb")
    }

    ns.toast(`${ns.getScriptName()}`, "success");
}

export function autocomplete(data: any, args: any) {
    return data.servers;
}
