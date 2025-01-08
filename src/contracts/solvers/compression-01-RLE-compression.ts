import { NS } from "@ns";

/** 
 * Run-length encoding (RLE) is a data compression technique which encodes data as a series of runs of a repeated single character. Runs are encoded as a length, followed by the character itself. Lengths are encoded as a single ASCII digit; runs of 10 characters or more are encoded by splitting them into multiple runs.
 * 
 * You are given the following input string:
 *     TppMMMMMMMMAUUfDDDeebbbbbbbEEOSSffffffwYYAAAAAAAzzzzzzzzzzttDD7
 * Encode it using run-length encoding with the minimum possible output length.
 * 
 * Examples:
 *     aaaaabccc            ->  5a1b3c
 *     aAaAaA               ->  1a1A1a1A1a1A
 *     111112333            ->  511233
 *     zzzzzzzzzzzzzzzzzzz  ->  9z9z1z  (or 9z8z2z, etc.)
 */

export const contractType = "Compression I: RLE Compression";
export const solver: ContractSolver = {
    solve(data: string): string {
        if (!data) return '';
    
        let result = '';
        let currentChar = data[0];
        let count = 1;
        
        // Helper function to append runs to result
        const appendRun = (count: number, char: string) => {
            // Split runs of 10 or more into multiple runs
            while (count > 0) {
                const currentRun = Math.min(count, 9);
                result += currentRun.toString() + char;
                count -= currentRun;
            }
        };
        
        // Process the data string
        for (let i = 1; i < data.length; i++) {
            if (data[i] === currentChar) {
                count++;
            } else {
                appendRun(count, currentChar);
                currentChar = data[i];
                count = 1;
            }
        }
        
        // Handle the last run
        appendRun(count, currentChar);
        
        return result;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        "TppMMMMMMMMAUUfDDDeebbbbbbbEEOSSffffffwYYAAAAAAAzzzzzzzzzzttDD7",
        "aaaaabccc",
        "aAaAaA",
        "111112333",
        "zzzzzzzzzzzzzzzzzzz",
    ];
    const results = ["1T2p8M1A2U1f3D2e7b2E1O2S6f1w2Y7A9z1z2t2D17", "5a1b3c", "1a1A1a1A1a1A", "511233", "9z9z1z"];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}