import { NS } from "@ns";

/** Add your description here */

export const contractType = "Minimum Path Sum in a Triangle";
export const solver: ContractSolver = {
    solve(data: number[][]): number {
        let n = data.length;
        let dp = data[n - 1].slice();
        for (let i = n - 2; i > -1; --i) {
            for (let j = 0; j < data[i].length; ++j) {
                dp[j] = Math.min(dp[j], dp[j + 1]) + data[i][j];
            }
        }
        return dp[0];
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [[2],
        [3,4],
       [6,5,7],
      [4,1,8,3]],
    ];
    const results = [11];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}