import { BehaviourTree, Status } from "/lib/BehaviourTree";
import { StateMachine } from "/lib/StateMachine";
import { NS } from "../bitburner/NetscriptDefinitions";
import { commonOpts, commonOptsHelp, debugCommonOpts } from "/util/options";
import { daemonOpts, daemonOptsHelp, debugDaemonOpts } from "/daemon/util";

enum State {
    waiting = "waiting",
    purchasing = "purchasing",
    killing = "killing"
}

interface Memory {
    ns: NS;
    args: any;
    target?: Action;
}

interface Action {
    cost: number;
    func: any;
    args: any[];
    timeToProfit?: number;
}

const number = new Intl.NumberFormat();

export async function main(ns: NS) {
    const help =
        `Usage: run ${ns.getScriptName()}\n` +
        "Spend money on the hacknet.\n" +
        "      --ttp       Maximum time to profit. (Default: 28,800s)\n" +
        "      --reserve   Money to keep on reserve. (Default: $0)\n" +
        daemonOptsHelp +
        commonOptsHelp;

    const flags: [string, string | number | boolean | string[]][] = [
        ["reserve", 0],
        ["ttp", 3600]
    ];
    flags.push(...daemonOpts);
    flags.push(...commonOpts);
    const args = ns.flags(flags);

    if (args.debug) {
        ns.print(`      --ttp       ${args.ttp}`);
        ns.print(`      --reserve   ${args.reserve}\n`);
        ns.print(debugDaemonOpts(args));
        ns.print(debugCommonOpts(args));
    } else {
        ns.disableLog("ALL");
    }

    if (args.help || args.h) {
        ns.tprintf(help);
        return;
    }

    const memory:Memory = { ns: ns, args: args };
    const brainOpts = {
        hooks: {
            success: (node: string, memory: any) => {
                ns.print(`${now()}: [Success] (${memory.target.func.name}) ${node}`);
            },
            failure: (node: string, memory: any) => {
                ns.print(`${now()}: [Failure] (${memory.target.func.name}) ${node}`);
            }
        }
    };
    const brain = new BehaviourTree(memory, brainOpts);
    const stateMachine = new StateMachine<Memory>(
        {
            states: {
                [State.waiting]: {
                    from: State.purchasing,
                    enter: [(memory: Memory) => {
                        memory.ns.print(`${now()}: [Waiting] (${memory.target!.func.name})`);
                        if (memory.args.debug) {
                            memory.ns.print(memory.target!.toString());
                        }
                    }],
                    action: () => brain.select(purchase),
                    transition: { success: State.purchasing, failure: State.killing }
                },
                [State.purchasing]: {
                    from: State.waiting,
                    enter: [(memory: Memory) => {
                        memory.ns.print(`${now()}: [Running]`);
                    }],
                    action: () => brain.sequence(findCheapest, approve, purchase),
                    transition: { running: State.waiting, failure: State.killing }
                },
                [State.killing]: {
                    from: "*"
                }
            },
            initial: State.purchasing,
            hooks: {
                denied: (from, to) => {
                    ns.print(`${now()}: [WARM] Denied '${from}' => '${to}'`)
                }
            }
        },
        memory
    );

    let running = true;
    while (running) {
        await stateMachine.do();

        if (args.once || args.o || stateMachine.is(State.killing)) {
            running = false;
        } else {
            await ns.sleep(args.sleep);
        }
    }
}

/**
 * Approve cost if the time to profit is acceptable.
 * @param memory Memory object to pass data between the brain functions.
 * @returns {Status} Will fail if the time to profit is too high.
 */
async function approve(memory: Memory): Promise<Status> {
    const ns: NS = memory.ns;
    let profitPerSecond = 0;
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        profitPerSecond += ns.hacknet.getNodeStats(i).production;
    }

    const cost = memory.target!.cost;
    const timeToProfit = Math.round(cost / profitPerSecond);
    memory.target!.timeToProfit = timeToProfit;
    if (memory.args.ttp > timeToProfit || profitPerSecond === 0) {
        return Status.success;
    } else {
        if (memory.args.debug) {
            ns.print(
                `${now()}: Time to profit (${number.format(timeToProfit)}s) exceeds (${number.format(
                    memory.args.ttp
                )}s)`
            );
        }
        return Status.failure;
    }
}

/**
 * Purchase target action from the hacknet.
 * @param memory Memory object to pass data between the brain functions.
 * @returns {Status} Will run until it can purchase the action.
 */
async function purchase(memory: Memory): Promise<Status> {
    const ns: NS = memory.ns;
    if (ns.getServerMoneyAvailable("home") > memory.target!.cost + memory.args.reserve) {
        if (!memory.args.dry) {
            memory.target!.func.call(null, ...memory.target!.args);
        }
        if (memory.args.toast) {
            ns.toast(`Hacknet: ${memory.target!.func.name}`);
        }
        return Status.success;
    } else {
        return Status.running;
    }
}

/**
 * Find the cheapest action on the hacknet.
 * @param memory Memory object to pass data between the brain functions.
 * @returns {Status.success}
 */
async function findCheapest(memory: Memory): Promise<Status> {
    const ns: NS = memory.ns;
    const actions: [{ cost: number; func: Function; args: any[] }] = [
        { cost: ns.hacknet.getPurchaseNodeCost(), func: ns.hacknet.purchaseNode, args: [] }
    ];
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        actions.push({ cost: ns.hacknet.getLevelUpgradeCost(i, 1), func: ns.hacknet.upgradeLevel, args: [i, 1] });
        actions.push({ cost: ns.hacknet.getRamUpgradeCost(i, 1), func: ns.hacknet.upgradeRam, args: [i, 1] });
        actions.push({ cost: ns.hacknet.getCoreUpgradeCost(i, 1), func: ns.hacknet.upgradeCore, args: [i, 1] });
    }
    actions.sort((a, b) => a.cost - b.cost);
    memory.target = actions[0];
    memory.target.toString = () => JSON.stringify({ name: memory.target!.func.name, ...memory.target }, null, 2);
    return Status.success;
}

/**
 * Utility function for time.
 * @returns hh:mm:ss
 */
function now() {
    return new Date().toTimeString().slice(0, 8);
}
