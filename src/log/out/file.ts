import { archive, maxFileLength } from "/log/config";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function file(ns: NS, logs: Logs) {
    const db: Logs = { streams: [] };
    if (ns.fileExists(archive)) {
        db.streams.push(...(JSON.parse(ns.read(archive)) as Logs).streams);
    }
    db.streams.push(...logs.streams);
    if (db.streams.length > maxFileLength) {
        db.streams.splice(0, db.streams.length - maxFileLength);
    }
    await ns.write(archive, JSON.stringify(db), "w");
}
