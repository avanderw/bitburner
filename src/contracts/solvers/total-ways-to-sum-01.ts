import { NS } from "@ns";

/** Add your description here */

export const contractType = "Total Ways to Sum";
export const solver: ContractSolver = {
    solve(data: number): number {
        let ways = [1];
        ways.length = data + 1;
        ways.fill(0, 1);
        for (let i = 1; i < data; ++i) {
            for (let j = i; j <= data; ++j) {
                ways[j] += ways[j - i];
            }
        }
        return ways[data];
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [5],
        [11],
    ];
    const results = [6, 55];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}