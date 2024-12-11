import { isAlive } from "/daemon/util";
import { init } from "/daemon/util/init";
import { NS } from "../bitburner/NetscriptDefinitions";

interface Stock {
    symbol: string;
    price: { avg: number; ask: number; bid: number };
    forecast: number;
    max: number;
    position: [number, number, number, number];
    volatility: number;
}

export async function main(ns: NS) {
    const args = init(ns, ["Trade on the stock market."], []);

    if (!args.init) {
        return;
    }

    const symbols = ns.stock.getSymbols();
    const history: { [sym: string]: Stock[] } = {};
    symbols.forEach(sym => (history[sym] = []));

    // const book = ns.stock.getOrders(); // 8.3

    while (isAlive(args)) {
        symbols.forEach(sym => {
            const stock: Stock = {
                symbol: sym,
                price: {
                    avg: ns.stock.getPrice(sym),
                    ask: ns.stock.getAskPrice(sym),
                    bid: ns.stock.getBidPrice(sym)
                },
                forecast: ns.stock.getForecast(sym),
                max: ns.stock.getMaxShares(sym),
                position: ns.stock.getPosition(sym),
                volatility: ns.stock.getVolatility(sym)
            };

            history[sym].push(stock);
            if (history[sym].length > 100) {
                history[sym].shift();
            }
        });
    }
}
