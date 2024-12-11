/**
 * Version 1: Initial release
 *
 * 0. Print versions of the scripts for review.
 */
export const version = "1.0-alpha";

import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
    const preAlpha: { script: string; version: string }[] = [];
    const alpha: { script: string; version: string }[] = [];
    const beta: { script: string; version: string }[] = [];
    const final: { script: string; version: string }[] = [];
    const review: string[] = [];

    ns.ls("home").forEach(script =>
        ns
            .read(script)
            .split("\n")
            .forEach((line: string) => {
                if (line.indexOf("const version") !== -1 && line.indexOf("-1") === -1) {
                    const ver = line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
                    if (ver.indexOf("pre-alpha") !== -1) {
                        preAlpha.push({ script: script, version: ver });
                    } else if (ver.indexOf("alpha") !== -1) {
                        alpha.push({ script: script, version: ver });
                    } else if (ver.indexOf("beta") !== -1) {
                        beta.push({ script: script, version: ver });
                    } else {
                        final.push({ script: script, version: ver });
                    }
                } else if (review.find(s => s === script) === undefined) {
                    review.push(script);
                }
            })
    );

    preAlpha.forEach(script => review.splice(review.indexOf(script.script), 1));
    alpha.forEach(script => review.splice(review.indexOf(script.script), 1));
    beta.forEach(script => review.splice(review.indexOf(script.script), 1));
    final.forEach(script => review.splice(review.indexOf(script.script), 1));

    let out = "\n";
    out += "Review\n----------\n";
    review.forEach(script => (out += `${script}\n`));
    out += `----------\n${review.length} of ${ns.ls("home").length}\n`;
    out += "\nPre-Alpha\n----------\n";
    preAlpha.forEach(script => (out += `${script.version}:${script.script}\n`));
    out += `----------\n${preAlpha.length} of ${ns.ls("home").length}\n`;
    out += "\nAlpha\n----------\n";
    alpha.forEach(script => (out += `${script.version}:${script.script}\n`));
    out += `----------\n${alpha.length} of ${ns.ls("home").length}\n`;
    out += "\nBeta\n----------\n";
    beta.forEach(script => (out += `${script.version}:${script.script}\n`));
    out += `----------\n${beta.length} of ${ns.ls("home").length}\n`;
    out += "\nFinal\n----------\n";
    final.forEach(script => (out += `${script.version}:${script.script}\n`));
    out += `----------\n${final.length} of ${ns.ls("home").length}\n`;

    ns.tprint(out);
}
