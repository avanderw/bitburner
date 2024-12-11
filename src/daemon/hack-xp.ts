import { init } from "/daemon/util/init";
import { isAlive } from "/daemon/util/isAlive";
import { Thread } from "/type/CustomEnums";
import { NS, Server } from "../bitburner/NetscriptDefinitions";
import { scan } from "/util/scan";

export async function main(ns: NS) {
    const args = init(
        ns,
        [
            `Identify and target servers which maximise hacking experience.`,
            "Will only use weaken, as not to impact a stable hack daemon."
        ],
        [{ option: "allocate", desc: "Allocate percentage free RAM on host.", default: 0.5 }]
    );

    if (!args.init) {
        return;
    }

    const scriptRam = ns.getScriptRam(Thread.weaken);

    while (isAlive(args)) {
        const hosts = ns.getPurchasedServers(); // lite version can be hardcoded ns.serverExists() is far cheaper.
        const target = scan(ns)
            .filter(s=>!s.purchasedByPlayer)
            .filter(s => s.hasAdminRights)
            .sort((a, b) => hackLevel(ns, a, b))
            .find(s => true); // lite version can be hardcoded.

        let maxTime = 0;
        hosts.forEach(host => {
            const freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
            const allocateRam = freeRam * args.allocate;
            const allocateThreads = allocateRam / scriptRam;

            ns.exec(Thread.weaken, host, allocateThreads, "--target", target!.hostname, "(daemon: hack-xp)");
            maxTime = Math.max(ns.getWeakenTime(host), maxTime);
        });
        await ns.sleep(maxTime + 100);
    }
}

function weakenTime(ns:NS, a:Server, b:Server):number {
    return ns.getWeakenTime(a.hostname) - ns.getWeakenTime(b.hostname);
}

function hackLevel(ns:NS, a:Server, b:Server):number {
    const level = ns.getHackingLevel();
    const aValue = (level - a.requiredHackingSkill) / level;
    const bValue = (level - b.requiredHackingSkill) / level;
    return aValue - bValue;
}