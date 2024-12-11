export function autocomplete(data: any) {
    return [...data.servers];
}

import { NS } from "/lib/NetscriptDefinitions";

export async function main(ns: NS) {
    await ns.weaken(ns.args[0] as string);
}