
import { NS } from "/lib/NetscriptDefinitions";

export async function main(ns: NS) {
    const purchased = purchaseServers(ns);
    if (purchased.length > 0) {
        ns.tprintf(formatTable(purchased));
    } else {
        ns.tprintf("No servers purchased");
    }
    ns.tprintf("\n");
}

function formatTable(obj: any[]): string {
    const NUMBER_FORMAT = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const colums = Object.keys(obj[0]);
    const rows = obj.map(o => Object.values(o));
    const widths = colums.map((c, i) => Math.max(c.length, Math.max(...rows.map(r => typeof r[i] === 'number' ? NUMBER_FORMAT.format(r[i] as number).length : (r[i] as object).toString().length))));
    const borderTop = widths.map(w => "─".repeat(w)).join("─┬─");
    const header = colums.map((c, i) => c.padEnd(widths[i])).join(" │ ");
    const divider = widths.map(w => "─".repeat(w)).join("─┼─");
    const borderBottom = widths.map(w => "─".repeat(w)).join("─┴─");
    const body = rows.map(
        r => r.map(
            (v, i) => typeof v === 'number' ? NUMBER_FORMAT.format(v).padStart(widths[i]) : (v as object).toString().padEnd(widths[i])
        ).join(" │ ")
    ).join("\n");
    return borderTop + "\n" + header + "\n" + divider + "\n" + body + "\n" + borderBottom;
}

function purchaseServers(ns: NS): any[] {
    const purchased = [];
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        const power = largestAffordablePower(ns);
        if (power > 2) {
            const host = {
                name: uuid4(),
                ram: Math.pow(2, power),
            }
            ns.purchaseServer(host.name, host.ram);
            purchased.push(host);
        } else {
            break;
        }
    }
    return purchased;
}

function largestAffordablePower(ns: NS) {
    const maxPower = 20;
    const budget = ns.getServerMoneyAvailable('home');
    for (let i = maxPower; i > 0; i--) {
        const cost = ns.getPurchasedServerCost(Math.pow(2, i));
        if (cost < budget) {
            return i;
        }
    }
    return 0;
}

function uuid4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}