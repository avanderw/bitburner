import { NS } from "/bitburner/NetscriptDefinitions";
import { debug, info, error } from "/log/in/api";
import { configDaemon, runDaemon } from "/util/daemon";
import { startupScript } from "/util/script";

export async function main(ns: NS) {
    const config = configDaemon(ns, "Batch", "Batch a sequence of hacks against a target.", [
        { name: "target", help: "Target for the hack.", default: ns.getHostname() },
        { name: "ratio", help: "Ratio of funds to hack of the available.", default: 0.75 },
        { name: "delay", help: "Timing schedule between threads.", default: 200 }
    ]);
    startupScript(ns, config);
    await runDaemon(ns, config, daemon);
}

async function daemon(ns: NS, config: any) {
    await info(ns, config, "Batch hack daemon started.");

    const wTime = ns.getWeakenTime(config.target);
    const gTime = ns.getGrowTime(config.target);
    const hTime = ns.getHackTime(config.target);
    const iterationDelay = config.delay * 4;
    const batchTotal = Math.floor(hTime / iterationDelay);

    // Compile batch offsets.
    const singleSchedule = {
        hWeaken: { startOffset: 0 },
        gWeaken: { startOffset: 2 * config.delay },
        grow: { startOffset: wTime + config.delay - gTime },
        hack: { startOffset: wTime - config.delay - hTime }
    };

    // Compile the schedule so that we maximise the number of iterations before conflicts.
    const startTime = new Date().getTime();
    const fullSchedule = [];
    for (let batch = 0; batch < batchTotal; batch++) {
        const batchDelay = batch * iterationDelay;
        const hStart = startTime + batchDelay + singleSchedule.hack.startOffset;
        const gStart = startTime + batchDelay + singleSchedule.grow.startOffset;
        const gwStart = startTime + batchDelay + singleSchedule.gWeaken.startOffset;
        const hwStart = startTime + batchDelay + singleSchedule.hWeaken.startOffset;
        fullSchedule.push({ action: "weaken", start: hwStart, duration: wTime, end: hwStart + wTime });
        fullSchedule.push({ action: "weaken", start: gwStart, duration: wTime, end: gwStart + wTime });
        fullSchedule.push({ action: "grow", start: gStart, duration: gTime, end: gStart + gTime });
        fullSchedule.push({ action: "hack", start: hStart, duration: hTime, end: hStart + hTime });
    }

    // Validate the schedule does not have a start after the first end.
    const maxStart = fullSchedule.reduce((max, s) => Math.max(max, s.start), 0);
    const minEnd = fullSchedule.reduce((min, s) => Math.min(min, s.end), Number.MAX_SAFE_INTEGER);
    if (maxStart > minEnd) {
        await error(ns, config, "Batch hack schedule is not valid. maxStart > minEnd.");
    } else if (maxStart + iterationDelay > minEnd) {
        await error(ns, config, "Batch hack schedule is not valid. maxStart + batchDelay > minEnd.");
    } else {
        await info(ns, config, "Batch hack schedule is valid.");
        fullSchedule.sort((a, b) => a.start - b.start);
    }

    // Run the schedule.
    for (let i = 0; i < fullSchedule.length; i++) {
        const s = fullSchedule[i];
        await debug(ns, config, `${i}: ${s.action} at ${new Date(s.start).toISOString()} for ${s.duration}`);

        if (i + 1 < fullSchedule.length) {
            const now = new Date().getTime();
            const n = fullSchedule[i + 1];
            if (n.start > now) {
                await ns.sleep(n.start - now);
            }
        }
    }

    // Wait for the last hack to finish.
    const maxEnd = fullSchedule.reduce((max, s) => Math.max(max, s.end), 0);
    const now = new Date().getTime();
    await ns.sleep(maxEnd - now);

    // Validate the schedule is complete.
    
    // Validate the hack was stable.

}
