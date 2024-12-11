import { init } from "/daemon/util/init";
import { NS } from "../bitburner/NetscriptDefinitions";
import { error, info } from "../util/tail";

export async function main(ns: NS) {
    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    });
    const args = init(
        ns,
        [`Purchase a server when available.`],
        [{ option: "ram", desc: "RAM to purchase.", default: 1048576 }]
    );

    if (!args.init) {
        return;
    }

    const prefix = "pserver-";
    let num = ns.getPurchasedServers().length;
    
    info(ns, "Starting daemon...");
    while (num < ns.getPurchasedServerLimit()) {
        const cost = ns.getPurchasedServerCost(args.ram);
        const wallet = ns.getServerMoneyAvailable("home");
        if (wallet > cost) {
            const name = prefix + num;
            if (ns.purchaseServer(name, args.ram) !== "") {
                num = ns.getPurchasedServers().length;
                const message = `Purchased //${name}/ (${number.format(args.ram)}GB)`;
                info(ns, message);
                if (args.toast) {
                    ns.toast(message);
                }
            } else {
                ns.tail();
                error(ns, `Could not purchase //${name}/ for ${currency.format(cost)} with ${currency.format(wallet)}`);
                throw new Error("Could not purchase server.");
            }
        }

        await ns.sleep(args.sleep);
    }
}
