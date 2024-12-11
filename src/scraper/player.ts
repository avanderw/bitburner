import { NS } from "/bitburner/NetscriptDefinitions";
import { gaugeBatch } from "/metric/in/api";
import { configDaemon, runDaemon } from "/util/daemon";
import { Config, startupScript } from "/util/script";

export async function main(ns: NS) {
    const config = configDaemon(ns, "Player", "Scrape scanned player metrics.", []);
    startupScript(ns, config);
    await runDaemon(ns, config, scrape);
}

async function scrape(ns: NS, config: Config) {
    const batch: { name: string; value: string | number }[] = [];
    const player = ns.getPlayer();
    batch.push({ name: "player.hacking.xp", value: player.hacking_exp });
    batch.push({ name: "player.hacking.level", value: player.hacking });
    await gaugeBatch(ns, batch);
}
