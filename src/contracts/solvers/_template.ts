import { NS } from "@ns";

/** Add your description here */

export const contractType = "Enter contract type here";
export const solver: ContractSolver = {
    solve(data: number[]): number {
        return data.length;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [1],
        [],
    ];
    const results = [1, 0];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}