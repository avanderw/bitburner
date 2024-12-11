import { NS } from "/bitburner/NetscriptDefinitions";
import { gaugeBatch, cumulativeBatch } from "/metric/in/api";
import { configDaemon, runDaemon } from "/util/daemon";
import { Config, startupScript } from "/util/script";

export async function main(ns: NS) {
    const config = configDaemon(ns, "Hacknet", "Scrape hacknet node metrics.", []);
    startupScript(ns, config);
    await runDaemon(ns, config, scrape);
}

async function scrape(ns: NS, config: Config) {
    const numNodes = ns.hacknet.numNodes();
    const guages: { name: string; value: string | number }[] = [];
    const cumulatives: { name: string; value: string | number }[] = [];
    for (let i = 0; i < numNodes; i++) {
        const node = ns.hacknet.getNodeStats(i);
        guages.push({ name: `hacknet.node.${i}.production`, value: node.production });
        guages.push({ name: `hacknet.node.${i}.level`, value: node.level });
        guages.push({ name: `hacknet.node.${i}.ram`, value: node.ram });
        guages.push({ name: `hacknet.node.${i}.cores`, value: node.cores });
        cumulatives.push({ name: `hacknet.node.${i}.totalProduction`, value: node.totalProduction });
    }

    await gaugeBatch(ns, guages);
    await cumulativeBatch(ns, cumulatives);
}
