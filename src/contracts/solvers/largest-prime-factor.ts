import { NS } from "@ns";

/** Add your description here */

export const contractType = "Find Largest Prime Factor";
export const solver: ContractSolver = {
    solve(data: number): number {
        const factors = [];
        let d = 2;
        let n = data;
        while (n > 1) {
            while (n % d == 0) {
                factors.push(d);
                n /= d;
            }
            d++;
        }

        return Math.max(...factors);
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        5,
        11,
        21,
    ];
    const results = [5, 11, 7];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}