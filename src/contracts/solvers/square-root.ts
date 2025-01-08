import { NS } from "@ns";

/** 
 * You are given a ~200 digit BigInt. Find the square root of this number, to the nearest integer.
 * Hint: If you are having trouble, you might consult https://en.wikipedia.org/wiki/Methods_of_computing_square_roots
 * 
 * Input number:
 * 83030221355421234576781442393653213521279391519506311705382935962202506795621567653337592681122772003167162880492604051767099139193684953019279456217816648816944174764127056133247713761030676836624338
 * 
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
*/

export const contractType = "Square Root";
export const solver: ContractSolver = {
    solve(data: string): string {
        // Convert input string to BigInt
        const n = BigInt(data);

        if (n < 0n) {
            throw new Error("Cannot calculate square root of negative number");
        }
        if (n === 0n) return "0";
        if (n === 1n) return "1";

        // Binary search implementation
        let left = 0n;
        let right = BigInt(n); // Fixed: explicitly convert to BigInt

        while (left <= right) {
            const mid = (left + right) / 2n;
            const square = mid * mid;

            if (square === n) {
                return mid.toString();
            }

            // Check if we're within 1 of the actual square root
            if (left === right - 1n) {
                const leftSquare = left * left;
                const rightSquare = right * right;

                if (n - leftSquare < rightSquare - n) {
                    return left.toString();
                } else {
                    return right.toString();
                }
            }

            if (square < n) {
                left = mid;
            } else {
                right = mid;
            }
        }

        return left.toString();
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        "83030221355421234576781442393653213521279391519506311705382935962202506795621567653337592681122772003167162880492604051767099139193684953019279456217816648816944174764127056133247713761030676836624338",
    ];
    const results = ["9112092040548165719388462012162716447041384602401452104838936726809508861307797570494908392400685065"];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}