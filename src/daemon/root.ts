import { NS } from "../bitburner/NetscriptDefinitions";
import { scan } from "/util/lite/scan";
import { ServerLite } from "../bitburner/CustomDefinitions";
import { init } from "/cmd/util/init";
import { info } from "../util/tail";

export async function main(ns: NS) {
    const number = Intl.NumberFormat();
    const args = init(ns, ["Root a target when the requirements are met."], []);

    if (!args.init) {
        return;
    }

    const all = scan(ns);
    info(
        ns,
        "Root status:" +
            all.reduce(
                (a, b) =>
                    ns.sprintf(
                        "%s[%5sμ] %s (:%s) %s\n",
                        a,
                        number.format(ns.getServerRequiredHackingLevel(b.hostname)),
                        ns.hasRootAccess(b.hostname) ? "🟢" : "🟠",
                        ns.getServerNumPortsRequired(b.hostname) + "",
                        b.hostname
                    ),
                "\n"
            )
    );

    let servers: ServerLite[] = all.filter(s => !ns.hasRootAccess(s.hostname));
    while (servers.length !== 0) {
        const myLevel = ns.getHackingLevel();
        const crackers = validCrackers(ns);

        servers
            .filter(s => ns.getServerRequiredHackingLevel(s.hostname) <= myLevel)
            .filter(s => ns.getServerNumPortsRequired(s.hostname) <= crackers.length)
            .forEach(hackable => {
                crackers.forEach(cracker => {
                    cracker.call(null, hackable.hostname);
                });

                ns.nuke(hackable.hostname);

                const message = ns.sprintf("[%s]🟢 %s", ns.getScriptName(), hackable.hostname);
                info(ns, message);
                ns.toast(message, "info");
            });
        servers = scan(ns).filter(s => !ns.hasRootAccess(s.hostname));

        if (args.once) {
            break;
        } else {
            await ns.sleep(60000);
        }
    }
}

function validCrackers(ns: NS): ((host: string) => void)[] {
    const portCrackers = [
        { file: "BruteSSH.exe", function: ns.brutessh },
        { file: "FTPCrack.exe", function: ns.ftpcrack },
        { file: "relaySMTP.exe", function: ns.relaysmtp },
        { file: "HTTPWorm.exe", function: ns.httpworm },
        { file: "SQLInject.exe", function: ns.sqlinject }
    ];

    return portCrackers.filter(c => ns.fileExists(c.file, "home")).map(c => c.function);
}
