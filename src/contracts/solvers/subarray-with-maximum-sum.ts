import { NS } from "@ns";

/** Add your description here */

export const contractType = "Subarray with Maximum Sum";
export const solver: ContractSolver = {
    solve(data: number[]): number {
        let max_so_far = data[0];
        let curr_max = data[0];

        for (let i = 1; i < data.length; i++) {
            curr_max = Math.max(data[i], curr_max + data[i]);
            max_so_far = Math.max(max_so_far, curr_max);
        }

        return max_so_far;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [1],
        [3,-8,-6,-10,10,10,4,7,-1,8,-10,-1,8,-5,-2,-9,8,-8,7,8,9,8,-2,-3,-3,-6],
    ];
    const results = [1, 51];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}