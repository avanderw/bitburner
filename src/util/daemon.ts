import {
    Config,
    ScriptOption,
    extractScriptFlags,
    extractScriptHelp,
    commandOptions,
    configZipkin
} from "/util/script";
import { NS } from "/bitburner/NetscriptDefinitions";

export const daemonOptions: ScriptOption[] = [
    { name: "sleep", help: "Milliseconds to wait between runs.", default: 1000 },
    { name: "runs", help: "Limit the deamon to this many runs.", default: -1 },
    { name: "toast", help: "Toast actions the daemon is taking.", default: false }
];

export async function runDaemon(ns: NS, config: Config, func: (ns: NS, args: any) => Promise<void>) {
    while (config.runs > 0 || config.runs == -1) {
        await func.call(null, ns, config);
        await ns.sleep(config.sleep);
        if (config.runs > 0) {
            config.runs--;
        }
    }
}

export function stopDaemon(ns: NS, config: Config) {
    config.runs = 0;
}

export function configDaemon(ns: NS, title: string, description: string, scriptOptions: ScriptOption[]): Config {
    const flags: [string, string | number | boolean | string[]][] = extractScriptFlags(scriptOptions);
    flags.push(...extractScriptFlags(commandOptions));
    flags.push(...extractScriptFlags(daemonOptions));
    const config: Config = ns.flags(flags);

    config.program = title;
    config.doc = {
        program: description,
        ...extractScriptHelp(scriptOptions),
        ...extractScriptHelp(commandOptions),
        ...extractScriptHelp(daemonOptions)
    };
    configZipkin(config);

    return config;
}
