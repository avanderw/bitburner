import { NS } from "@ns";

/** Add your description here */

export const contractType = "Unique Paths in a Grid I";
export const solver: ContractSolver = {
    solve(data: number[]): number {
        let n = data[0]; // Number of rows
        let m = data[1]; // Number of columns
        let currentRow = [];
        currentRow.length = n;
        for (let i = 0; i < n; i++) {
            currentRow[i] = 1;
        }
        for (let row = 1; row < m; row++) {
            for (let i = 1; i < n; i++) {
                currentRow[i] += currentRow[i - 1];
            }
        }
        return currentRow[n - 1];
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [10, 5],
        [3, 3],
    ];
    const results = [715, 6];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}