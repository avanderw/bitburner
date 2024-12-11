import { NS } from "../bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    });
    const args = ns.flags([
        ["analyze", false],
        ["servers", 25],
        ["ram", -1],
        ["debug", false],
        ["dry", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h) {
        const help =
            `Usage: run ${ns.getScriptName()}\n` +
            "Purchase servers.\n" +
            "      --analyze   Show cost breakdown, with recommendation.\n" +
            "      --servers   Attempt to purchase X servers. (Default: max)\n" +
            "      --ram       Specify RAM to purchase. (Default: max)\n" +
            "      --tail      Open the tail window.\n" +
            "      --dry       Log instead of make actions.\n" +
            "      --debug     Enable debug logging.\n" +
            "  -h, --help      Show this help message and exit.";

        ns.tprintf(help);
        return;
    }
    if (!args.debug) {
        ns.disableLog("ALL");
    }

    /**
     * [ ] Output what was purchased to console.
     * [ ] Write a deamon to purchase specified ram.
     * [ ] Fix bug when naming second purchase e.g. pserver-0-0
     */

    const money = ns.getServerMoneyAvailable("home");
    const owned = ns.getPurchasedServers();
    const limit = Math.min(ns.getPurchasedServerLimit() - owned.length, args.servers);

    const options = [];
    let recommend = 0;
    for (let i = 1; i <= 20; i++) {
        const ram = Math.pow(2, i);
        const cost = ns.getPurchasedServerCost(ram);
        const canMax = money / cost > limit;
        if (canMax) {
            recommend = ram;
        }
        options.push({ ram: ram, cost: cost });
    }

    if (limit === 0) {
        recommend = -1;
    }

    if (args.analyze) {
        ns.tprintf("%14s %15s %18s", "== RAM ==", "== COST x1 ==", `== COST x${ns.getPurchasedServerLimit()} ==`);
        for (let i = 0; i < options.length; i++) {
            ns.tprintf(
                "%s %9sGB: %15s %18s %s",
                money - options[i].cost > 0 ? "✔" : "✕",
                number.format(options[i].ram),
                currency.format(options[i].cost),
                currency.format(options[i].cost * ns.getPurchasedServerLimit()),
                options[i].ram === recommend ? "(Recommended)" : ""
            );
        }

        args.dry = true;
    }

    if (limit === 0) {
        ns.tprint("Maximum allowed servers reached.");
        return;
    }

    const ram = args.ram === -1 ? recommend : args.ram;
    const purchase = Math.min(limit, Math.floor(money / ns.getPurchasedServerCost(ram)));
    const cost = ns.getPurchasedServerCost(ram) * purchase;
    if (args.dry) {
        ns.tprintf("> Purchase %sx%sGB servers for %s.", purchase, number.format(ram), currency.format(cost));
    } else {
        for (let i = ns.getPurchasedServers().length; i < ns.getPurchasedServerLimit(); i++) {
            ns.purchaseServer(`pserver-${i}`, ram);
        }
    }
}
