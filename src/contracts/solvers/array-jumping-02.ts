import { NS } from "@ns";

/** 
 * You are given the following array of integers:
 * 
 * 2,1,4,2,1,5,4,1,3,2,3,0,3,3,2,4,7,3,2
 * 
 * Each element in the array represents your MAXIMUM jump length at that position. 
 * This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
 * 
 * Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the end of the array.
 * 
 * If it's impossible to reach the end, then the answer should be 0.
 */

/**
 * 
 * You are given the following array of integers:
 * 
 * 0,3,2,5,2,2,2,3,3,3,4,4,3,2,2,1,4
 * 
 * Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
 * 
 * Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the end of the array.
 * 
 * If it's impossible to reach the end, then the answer should be 0.
 */

/**
 * 
 * You are given the following array of integers:
 * 
 * 3,2,2,3,2,3,3,4,5,3,2,1
 * 
 * Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
 * 
 * Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the end of the array.
 * 
 * If it's impossible to reach the end, then the answer should be 0.
 */

export const contractType = "Array Jumping Game II";
export const solver: ContractSolver = {
    solve(data: number[]): number {
        let n = data.length;
        let dp: any[] = [];
        for (let i = 0; i < n; ++i) {
            dp.push(0);
        }
        for (let i = 0; i < n; ++i) {
            if (dp[i] === 0 && i !== 0) {
                continue;
            }
            for (let j = 1; j <= data[i]; ++j) {
                if (i + j < n) {
                    dp[i + j] = dp[i + j] !== 0 ? Math.min(dp[i + j], dp[i] + 1) : dp[i] + 1;
                }
            }
        }
        return dp[n - 1];
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [2, 1, 4, 2, 1, 5, 4, 1, 3, 2, 3, 0, 3, 3, 2, 4, 7, 3, 2],
        [0, 3, 2, 5, 2, 2, 2, 3, 3, 3, 4, 4, 3, 2, 2, 1, 4],
        [3, 2, 2, 3, 2, 3, 3, 4, 5, 3, 2, 1],
    ];
    const results = [6, 0, 4];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}