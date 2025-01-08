import { NS } from "@ns";
import { ContractSolverRegistry } from "./lib/ContractSolverRegistry";
import { ContractScanner } from "./lib/ContractScanner";
import { TableFormatter } from "/lib/TableFormatter";

// Main script
export async function main(ns: NS): Promise<void> {
    const numberFormatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    const registry = new ContractSolverRegistry();
    const scanner = new ContractScanner(ns);

    const contracts = scanner.scanNetwork();
    if (contracts.length > 0) {
        const contractByType = contracts.reduce((acc, contract) => {
            if (!acc[contract.type]) {
                acc[contract.type] = [];
            }
            acc[contract.type].push(contract);
            return acc;
        }, {} as Record<string, Contract[]>);

        let totalMoney = 0;
        const successes: Contract[] = [];
        const failures: Contract[] = [];
        for (const type in contractByType) {
            if (!registry.hasSolver(type)) { continue; }
            ns.tprintf(`Solving ${numberFormatter.format(contractByType[type].length)} contracts of type ${type}`);

            const contracts = contractByType[type];
            for (const contract of contracts) {
                const data = ns.codingcontract.getData(contract.filename, contract.server);
                const reward = ns.codingcontract.attempt(registry.getSolver(type)!.solve(data), contract.filename, contract.server);
                
                if (reward === "") {
                    failures.push(contract);
                } else {
                    totalMoney += moneyReward(ns, reward);
                    successes.push(contract);
                }
            }
        }

        const tableFormatter = new TableFormatter();
        if (successes.length > 0) {
            ns.tprintf(
                `\n${tableFormatter.format(createSummary(successes), { title: `${successes.length} contracts solved`, limit: 5 })}` +
                `\nTotal money gained: $${ns.formatNumber(totalMoney)}`
            );
        }
        if (failures.length > 0) {
            ns.tprint(`\n${tableFormatter.format(createSummary(failures), { title: `${failures.length} contracts failed`, limit: 13 })}`);
        }
        if (successes.length === 0 && failures.length === 0) {
            ns.tprintf(`WARN: Missing solvers for scanned contracts\n${tableFormatter.format(createSummary(contracts), { title: `${numberFormatter.format(contracts.length)} contracts available` })}`);
        }
    } else {
        ns.tprintf("No contracts found");
    }
}

function moneyReward(ns:NS, reward: string): number {
    const rewardMatch = reward.match(/Gained \$([\d.]+)m/);
    if (!rewardMatch) {
        ns.tprint(`WARN: Unexpected reward format: ${reward}`);
        return 0;
    }
    return rewardMatch ? parseFloat(rewardMatch[1]) * 1_000_000 : 0;
}

function createSummary(contracts: any[]) {
    const contractTypeCounts = frequencyBy(contracts, "type");
    const contractTypeSummary = Object.keys(contractTypeCounts).map(k => ({
        type: k,
        count: contractTypeCounts[k],
    }));
    contractTypeSummary.sort((a, b) => b.count - a.count);
    return contractTypeSummary;
}

function frequencyBy(items: any[], key: string): { [key: string]: number } {
    return items.reduce((acc, item) => {
        if (acc[item[key]] === undefined) {
            acc[item[key]] = 0;
        }
        acc[item[key]] += 1;
        return acc;
    }, {} as Record<string, number>);
}
