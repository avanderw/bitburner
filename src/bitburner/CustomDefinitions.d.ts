import { Server } from "/bitburner/NetscriptDefinitions";

export interface Server extends Server {
    readonly path: string[];
    readonly files: string[];
    readonly hackChance: number;
    readonly hackTime: number;
    readonly weakenTime: number;
    readonly growTime: number;
    toString(): string;
}

export interface ServerLite {
    readonly hostname: string;
    readonly path: string[];
    toString(): string;
}

export interface ScriptConfig {
    runs: number;
    threads: number;
    ram: number;
    time?: number;
}

export interface ScriptOption {
    option: string;
    desc: string;
    default: string | number | boolean | string[];
}

