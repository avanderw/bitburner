import { error } from "./util/tail";
import { init } from "/cmd/util/init";
import { NS } from "./bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const args = init(
        ns,
        ["Load daemon threads."],
        [
            { option: "reserve", desc: "Amount of RAM to reserve.", default: 0 },
            { option: "lite", desc: "Use low RAM mode.", default: false }
        ]
    );

    const number = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2
    });
    const hostname = "home";
    const host = ns.getServer(hostname);
    const scripts =
        host.maxRam < 1024 || args.lite
            ? [
                  "/daemon/hacknet.js",
                  "/daemon/root.js",
                  "/daemon/scheduler/lite/prep.js",
                  "/daemon/scheduler/lite/hack.js",
                  "/daemon/purchase.js",
                  "/daemon/contract.js",
                  "/daemon/hack-xp.js"
              ]
            : [
                  "/daemon/hacknet.js",
                  "/daemon/root.js",
                  "/daemon/scheduler/prep.js",
                  "/daemon/scheduler/hack.js",
                  "/daemon/purchase.js",
                  "/daemon/contract.js",
                  "/daemon/hack-xp.js"
              ];
    let out =
        "\n" +
        "██████╗░██╗████████╗██████╗░██╗░░░██╗██████╗░███╗░░██╗███████╗██████╗░\n" +
        "██╔══██╗██║╚══██╔══╝██╔══██╗██║░░░██║██╔══██╗████╗░██║██╔════╝██╔══██╗\n" +
        "██████╦╝██║░░░██║░░░██████╦╝██║░░░██║██████╔╝██╔██╗██║█████╗░░██████╔╝\n" +
        "██╔══██╗██║░░░██║░░░██╔══██╗██║░░░██║██╔══██╗██║╚████║██╔══╝░░██╔══██╗\n" +
        "██████╦╝██║░░░██║░░░██████╦╝╚██████╔╝██║░░██║██║░╚███║███████╗██║░░██║\n" +
        "╚═════╝░╚═╝░░░╚═╝░░░╚═════╝░░╚═════╝░╚═╝░░╚═╝╚═╝░░╚══╝╚══════╝╚═╝░░╚═╝\n" +
        "\n" +
        "Copyright (C) 2021-2022, avanderw.co.za\n" +
        "\n" +
        "Main Processor : Bitburner(R) Core(TM)2 Quad CPU 3.28GHz, ${cpu}CPU(s)\n" +
        "Memory Testing : ${free}GB OK (Installed Memory: ${installed}GB)\n" +
        "USB Devices(s) : 1 Mouse, 1 Keyboard\n" +
        "Auto-Detecting : NVMe 1 ... Hard Disk\n" +
        "\n" +
        "Initializing from NVMe 1...\n" +
        "\n";
    out = out.replace("${cpu}", host.cpuCores + "");
    out = out.replace("${installed}", number.format(host.maxRam) + "");
    out = out.replace("${free}", number.format(host.maxRam - host.ramUsed) + "");

    let outOfMemory = false;
    scripts.forEach(script => {
        if (ns.ps(hostname).find(p => p.filename === script)) {
            out += ns.sprintf("↻ Running [%5sGB]: %s\n", number.format(ns.getScriptRam(script)), script);
        } else {
            const remainingRam = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname) - ns.getScriptRam(script);
            if (remainingRam > args.reserve && !outOfMemory) {
                if (!args.dry) {
                    if (ns.run(script, 1, args.debug ? "--debug" : "", args.tail ? "--tail" : "") === 0) {
                        error(ns, "Could not load " + script);
                        ns.tail();
                    }
                }
                out += ns.sprintf(
                    "↪ Loading [%5sGB]: %-32s ...%6sGB remaining\n",
                    number.format(ns.getScriptRam(script)),
                    script,
                    number.format(ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))
                );
            } else {
                out += ns.sprintf("↩ Reserve [%5sGB]: %s\n", number.format(ns.getScriptRam(script)), script);
                outOfMemory = true;
            }
        }
    });

    ns.tprint(out);
}
