import { NS } from "/lib/NetscriptDefinitions";

const release = {
    "version": "1.6-beta",
    "description": "List files on a host.",
    "log": [
        "1.0 File versions", 
        "1.1 Auto tail", 
        "1.2 Description", 
        "1.3 Update indicator", 
        "1.4 Memory usage", 
        "1.5 Colour", 
        "1.6 Filters"
    ]
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export async function main(ns: NS) {
    ns.clearLog();
    const filter = ns.args[0] as string || "";
    const files = ns.ls("home", filter).map(filename => {
        const content = ns.read(filename).toString();
        const relMatch = content.match(/const release = ({[\w\W]+]\s+});\s/);
        if (relMatch) {
            try {
                const rel = JSON.parse(relMatch[1]);
                const ref = rel.version.match(/(\d+\.\d+)/);
                const latest = rel.log[rel.log.length - 1];
                const startsWithRef = latest.startsWith(ref[1]);
                if (!startsWithRef) {
                    rel.version += "*";
                }
                return { name: filename, version: rel.version, desc: rel.description, memory: NUMBER_FORMAT.format(ns.getScriptRam(filename)) };
            } catch (e) {
                return { name: filename, version: "?", desc: "Unknown", memory: "0.00" };
            }
        } else {
            return { name: filename, version: "?", desc: "Unknown", memory: "0.00" };
        }
    });

    const maxMemory = files.reduce((max, file) => Math.max(max, file.memory.length), 0);
    const maxFilename = files.reduce((max, curr) => Math.max(max, curr.name.length), 0);
    const maxVersion = files.reduce((max, curr) => Math.max(max, curr.version.length), 0);
    let out = "";
    files.forEach(file => {
        const dev = file.version.indexOf("dev") > 0;
        const alpha = file.version.indexOf("alpha") > 0;
        const beta = file.version.indexOf("beta") > 0;
        if (dev) {
            out += `\u001b[31m`
        } else if (alpha) {
            out += `\u001b[33m`
        } else if (beta) {
            out += `\u001b[36m`
        }
        out += `[${file.memory.padStart(maxMemory)}GB]  `;
        out += file.name.padEnd(maxFilename + 2);
        out += file.version.padEnd(maxVersion + 2);
        out += file.desc;
        out += "\u001b[0m\n";
    });
    ns.print(out);
    ns.tail();
}