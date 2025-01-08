import { NS } from "@ns";

/** Add your description here */

export const contractType = "Total Ways to Sum II";
export const solver: ContractSolver = {
    solve(data: (number | number[])[]): number {
        const n = data[0] as number;
        const set = data[1] as number[];
        let ways = [1];
        ways.length = n + 1;
        ways.fill(0, 1);
        for (const element of set) {
            for (let j = element; j <= n; j++) {
                ways[j] += ways[j - element];
            }
        }
        return ways[n];
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [23, [3,5,6,7,8,9,12,13,16,17,18]],
    ];
    const results = [30];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}