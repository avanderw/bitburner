import { NS } from "@ns";

/** Add your description here */

export const contractType = "Merge Overlapping Intervals";
export const solver: ContractSolver = {
    solve(data: number[][]): number[][] {
        data.sort((a, b) => a[0] - b[0]);
        let result: number[][] = [];
        let start = data[0][0];
        let end = data[0][1];
        for (const interval of data) {
            if (interval[0] <= end) {
                end = Math.max(end, interval[1]);
            } else {
                result.push([start, end]);
                start = interval[0];
                end = interval[1];
            }
        }
        result.push([start, end]);
        return result;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [[1, 3], [8, 10], [2, 6], [10, 16]],
    ];
    const results = [[[1, 6], [8, 16]]];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        for (let j = 0; j < result.length; j++) {
            if (result[j][0] !== results[i][j][0] || result[j][1] !== results[i][j][1]) {
                err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
                break;
            }
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}