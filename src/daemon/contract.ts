import { init } from "/daemon/util/init";
import { Command } from "/type/CustomEnums";
import { NS } from "../bitburner/NetscriptDefinitions";
import { error, info } from "../util/tail";

export async function main(ns: NS) {
    const args = init(ns, [`Run contract solver periodically.`], []);

    if (!args.init) {
        return;
    }

    const scriptRam = ns.getScriptRam(Command.contract);
    info(ns, "Starting daemon...");
    while (true) {
        if (ns.getServerMaxRam("home") - ns.getServerUsedRam("home") > scriptRam) {
            const pid = ns.run(Command.contract, 1);

            if (pid === 0) {
                ns.tail();
                error(ns, `Could not execute '${Command.contract}' on //home/`);
                return;
            }
        }

        await ns.sleep(args.sleep === 1000 ? 300000 : 1000);
    }
}
