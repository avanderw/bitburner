import { delta, gauge, cumulative, test } from "/metric/in/api";
import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    await delta(ns, "test", Math.random() * 10 + "");
    await gauge(ns, "test", Math.random() * 10 + "");
    await cumulative(ns, "test", Math.random() * 10 + "");
    await test(ns, "test", Math.random() * 10 + "");
}
