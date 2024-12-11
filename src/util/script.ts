import { NS } from "/bitburner/NetscriptDefinitions";
import { asciiTitle, table, wrap } from "/format/terminal";

export interface Config {
    program: string;
    doc: { [key: string]: string };
    [key: string]: any;
}

export interface ScriptOption {
    name: string;
    help: string;
    default: string | number | boolean | string[];
}

export const commandOptions: ScriptOption[] = [
    { name: "b3", help: "Zipkin trace header.", default: "" },
    { name: "help", help: "Print this commands help and exit.", default: false },
    { name: "tail", help: "Open the log window for this run.", default: false },
    { name: "dry", help: "Print actions instead of taking them.", default: false },
    { name: "debug", help: "Enable debug logging.", default: false }
];

export function extractScriptFlags(options: ScriptOption[]): [string, string | number | boolean | string[]][] {
    const flags: [string, string | number | boolean | string[]][] = [];

    options.forEach(opt => {
        flags.push([opt.name, opt.default]);
    });

    return flags;
}

export function extractScriptHelp(options: ScriptOption[]): { [key: string]: string } {
    const help: { [key: string]: string } = {};

    options.forEach(opt => {
        help[opt.name] = opt.help;
    });

    return help;
}

export function startupScript(ns: NS, config: Config) {
    let out = asciiTitle(config.program) + "\n";
    out += wrap(config.doc.program) + "\n";

    if (!config.debug) {
        ns.disableLog("ALL");
    }

    if (config.help) {
        out += buildHelp(config);
        ns.tprint("\n" + out);
        ns.print(out);
        ns.exit();
    }

    ns.print(out);
}

function buildHelp(config: Config) {
    const data: (string | number | boolean | string[])[][] = [];
    const exclude = ["_", "program", "doc"];

    for (let field in config) {
        if (exclude.indexOf(field) === -1) {
            data.push(["  --" + field, config[field], config.doc[field]]);
        }
    }

    return "\nOptions:\n" + table(data);
}

export function configScript(ns: NS, title: string, description: string, scriptOptions: ScriptOption[]): Config {
    const flags: [string, string | number | boolean | string[]][] = extractScriptFlags(scriptOptions);
    flags.push(...extractScriptFlags(commandOptions));
    const config: Config = ns.flags(flags);

    config.program = title;
    config.doc = {
        program: description,
        ...extractScriptHelp(scriptOptions),
        ...extractScriptHelp(commandOptions)
    };
    configZipkin(config);

    return config;
}

export function configZipkin(config: any) {
    if (config.b3) {
        const header = config.b3.split("-");
        config.traceId = header[0];
        config.sampling = header[2];
        config.parentId = header[1];
    } else {
        config.traceId = generateId(32);
        config.sampling = 1;
    }
    config.spanId = generateId(16);
}

export function generateB3(config:any) {
    return `${config.traceId}-${config.spanId}-${config.sampling}`;
}

export function generateId(length: number): string {
    const characters = "abcdef0123456789";
    let result = "";
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
