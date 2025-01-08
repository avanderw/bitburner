import { NS } from "@ns";

/** Add your description here */

export const contractType = "Algorithmic Stock Trader III";
export const solver: ContractSolver = {
    solve(data: number[]): number {
        let hold1 = Number.MIN_SAFE_INTEGER;
        let hold2 = Number.MIN_SAFE_INTEGER;
        let release1 = 0;
        let release2 = 0;
        for (const price of data) {
            release2 = Math.max(release2, hold2 + price);
            hold2 = Math.max(hold2, release1 - price);
            release1 = Math.max(release1, hold1 + price);
            hold1 = Math.max(hold1, -price);
        }
        return release2;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [1, 2, 3, 4, 9, 2, 3, 9, 4, 6],
        [196, 8, 175, 130, 128, 120, 43, 151, 8, 133, 163, 50, 71, 115, 6, 158, 194, 82, 98, 171],
        [],
    ];
    const results = [15, 355, 0];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}