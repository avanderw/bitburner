import { archive, maxFileLength } from "/trace/config";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function file(ns:NS, spans:Span[]) {
    const db:Span[] = [];
    if (ns.fileExists(archive)) {
        db.push(...JSON.parse(ns.read(archive)));
    }
    db.push(...spans);
    if (db.length > maxFileLength) {
        db.splice(0, db.length - maxFileLength);
    }
    await ns.write(archive, JSON.stringify(db), "w");
}