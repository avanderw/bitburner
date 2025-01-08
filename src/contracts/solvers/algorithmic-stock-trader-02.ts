import { NS } from "@ns";

/** Add your description here */

export const contractType = "Algorithmic Stock Trader II";
export const solver: ContractSolver = {
    solve(data: number[]): number {
        let profit = 0;
        for (let i = 1; i < data.length; i++) {
            let sub = data[i] - data[i - 1];
            if (sub > 0) {
                profit += sub;
            }
        }
        return profit;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [1, 2, 3, 4, 9, 2, 3, 9, 4, 6],
        [],
    ];
    const results = [17, 0];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}