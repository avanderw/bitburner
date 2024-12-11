export enum Port {
    hack = 1,
    weaken = 2,
    grow = 3,
    trace = 4
}

export enum Daemon {
    prep = "/daemon/prep.js",
    prepLight = "/daemon/lite/prep.js",
    hack = "/daemon/hack.js"
}

export enum Command {
    contract = "/cmd/contract.js"
}

export enum Thread {
    weaken = "/cmd/thread/weaken.js",
    grow = "/cmd/thread/grow.js",
    hack = "/cmd/thread/hack.js"
}

export enum Scheduler {
    prep = "/daemon/scheduler/prep.js"
}