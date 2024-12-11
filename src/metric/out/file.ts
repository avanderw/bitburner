import { archive, maxFileLength } from "/metric/config";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function file(ns:NS, metrics:Metric[]) {
    const db:Metric[] = [];
    if (ns.fileExists(archive)) {
        db.push(...JSON.parse(ns.read(archive)));
    }
    db.push(...metrics);
    if (db.length > maxFileLength) {
        db.splice(0, db.length - maxFileLength);
    }
    await ns.write(archive, JSON.stringify(db), "w");
}