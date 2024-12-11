/**
 * MUST purchase the TIX API before running this script.
 */

import { NS } from "/lib/NetscriptDefinitions";

export function main(ns: NS): void {
    if (!ns.stock.hasTIXAPIAccess()) {
        ns.tprintf("Stock market is not available.");
        return;
    }

    const stocks = ns.stock.getSymbols().map(s => ({
        symbol: s,
        price: ns.stock.getPrice(s),
        ask: ns.stock.getAskPrice(s),
        bid: ns.stock.getBidPrice(s),
        spread: ns.stock.getAskPrice(s) - ns.stock.getBidPrice(s),
        own: ns.stock.getPosition(s)[0],
        shares: ns.stock.getMaxShares(s) - ns.stock.getPosition(s)[0],
    }));

    ns.tprintf(formatTable(stocks));
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