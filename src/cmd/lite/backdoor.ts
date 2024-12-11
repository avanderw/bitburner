import { ServerLite } from "../../bitburner/CustomDefinitions";
import { NS } from "../../bitburner/NetscriptDefinitions";
import { commonOpts, commonOptsHelp, debugCommonOpts } from "/util/options";
import { scan } from "/util/lite/scan";

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}

export async function main(ns: NS) {
    const help =
        `\n      Usage: run ${ns.getScriptName()}\n` +
        "  Description: Install backdoor on each milestone server. (Lite varient)\n" +
        "             - Print out the commands to backdoor the server.\n" +
        "             - Does not cheat. e.g. automate UI clicks.\n" +
        "             - Hardcode where we can save RAM.\n" +
        "             - No singularity functions.\n" +
        "\nOptions:\n" +
        "      --target    Servers to install the backdoor on.\n" +
        "                  (Default: ['CSEC','avmnite-02h', 'I.I.I.I', 'run4theh111z'])\n" +
        commonOptsHelp +
        "\n";

    const flags: [string, string | number | boolean | string[]][] = [["target", ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"]]];
    flags.push(...commonOpts);

    const args = ns.flags(flags);
    if (args.debug) {
        ns.tail();
        ns.print(debugCommonOpts(args));
    } else {
        ns.disableLog("ALL");
    }

    if (args.help || args.h) {
        ns.tprintf(help);
        return;
    }

    command(ns, args);
}

function command(ns: NS, args: any): void {
    const all = scan(ns);

    let out = "\n";
    for (let hostname of args.target) {
        const server: ServerLite = all.find(s => s.hostname == hostname)!;
        out +=
            server.path.filter(p => p !== "home").reduce((a, b) => `${a};connect ${b}`, "home") +
            `;connect ${server.hostname};backdoor\n`;
    }
    ns.tprint(out);
}
