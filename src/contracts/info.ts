import { NS } from "@ns";
import { TableFormatter } from "/lib/TableFormatter";
import { ContractSolverRegistry } from "./ContractSolverRegistry";
import { ContractScanner } from "./ContractScanner";

export async function main(ns: NS) {
    const numberFormatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    const tableFormatter = new TableFormatter();
    const registry = new ContractSolverRegistry();
    const scanner = new ContractScanner(ns);

    const contracts = scanner.scanNetwork();
    if (contracts.length > 0) {
        const contractTypeCounts = frequencyBy(contracts, "type");
        const contractTypeSummary = Object.keys(contractTypeCounts).map(k => ({
            type: k,
            count: contractTypeCounts[k],
            example: formatPath(contracts.find(c => c.type === k)),
            solver: registry.hasSolver(k) ? "Found" : "\x1b[38;5;124mMissing\x1b[0m"
        }));
        contractTypeSummary.sort((a, b) => b.count - a.count);

        ns.tprint(`\n${tableFormatter.format(contractTypeSummary, { title: `${numberFormatter.format(contracts.length)} contracts available` })}`);
    } else {
        ns.tprintf("No contracts found");
    }
}

function formatPath(contract: any): string {
    return "//" + contract.server + "/" + contract.filename;
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
