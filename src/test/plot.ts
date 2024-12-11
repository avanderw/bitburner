import { plot } from "/lib/asciichart";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    ns.tail();
    ns.print(plot([[1,2,3,4,5]]))
}