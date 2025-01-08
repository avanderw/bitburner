import { NS } from "@ns";

/**
 * Caesar cipher is one of the simplest encryption technique. 
 * It is a type of substitution cipher in which each letter in the plaintext is replaced by a letter some fixed number of positions down the alphabet. 
 * For example, with a left shift of 3, D would be replaced by A, E would become B, and A would become X (because of rotation).
 * 
 * You are given an array with two elements:
 *   ["MEDIA TRASH INBOX QUEUE MODEM", 2]
 * The first element is the plaintext, the second element is the left shift value.
 * 
 * Return the ciphertext as uppercase string. Spaces remains the same.
 */

export const contractType = "Encryption I: Caesar Cipher";
export const solver: ContractSolver = {
    solve(data: (string | number)[]): string {
        const message: string = data[0] as string;
        const leftShift: number = data[1] as number;
        let ans = "";
        for (let i = 0; i < message.length; i++) {
            let c = message.charCodeAt(i);
            if (c < 65 || c > 90) {
                ans += String.fromCharCode(c);
                continue;
            }
            c -= 65;
            c -= leftShift;
            if (c < 0) {
                c += 26;
            }
            c = c % 26;
            c += 65;
            ans += String.fromCharCode(c);
        }
        return ans;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        ["MEDIA TRASH INBOX QUEUE MODEM", 2],
    ];
    const results = ["KCBGY RPYQF GLZMV OSCSC KMBCK"];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}