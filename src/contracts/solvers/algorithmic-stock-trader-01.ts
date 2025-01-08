import { NS } from "@ns";

/** Add your description here */

export const contractType = "Algorithmic Stock Trader I";
export const solver: ContractSolver = {
    solve(data: number[]): number {
        let max = 0;
        for (let i = 0; i < data.length; i++) {
            const buy = data[i];
            const sell = Math.max(...data.slice(i + 1));
            const profit = sell - buy;
            max = Math.max(profit, max);
        }
        return max;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [1,2,3,4,9,2,3,9,4,6],
        [],
    ];
    const results = [8, 0];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}