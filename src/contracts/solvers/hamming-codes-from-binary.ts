import { NS } from "@ns";

/**
 * You are given the following encoded binary string:
 * '1011000000000000100000000000001000010001011010100011011111111000'
 * 
 * Treat it as an extended Hamming code with 1 'possible' error at a random index.
 * Find the 'possible' wrong bit, fix it and extract the decimal value, which is hidden inside the string.
 * 
 * Note: The length of the binary string is dynamic, but its encoding/decoding follows Hamming's 'rule'
 * Note 2: Index 0 is an 'overall' parity bit. Watch the Hamming code video from 3Blue1Brown for more information
 * Note 3: There's a ~55% chance for an altered Bit. So... MAYBE there is an altered Bit 😉
 * Note: The endianness of the encoded decimal value is reversed in relation to the endianness of the Hamming code. 
 *       Where the Hamming code is expressed as little-endian (LSB at index 0), 
 *       the decimal value encoded in it is expressed as big-endian (MSB at index 0).
 * Extra note for automation: return the decimal value as a string
 */

/**
 * '00101100' -> '12'
 */

export const contractType = "HammingCodes: Encoded Binary to Integer";
export const solver: ContractSolver = {
    solve(data: string): number {
        // Helper function to check if number is power of 2
        const isPowerOf2 = (num: number): boolean => {
            return num > 0 && (num & (num - 1)) === 0;
        };

        // Helper function to get data bits (non-parity positions)
        const getDataBits = (str: string): string => {
            let result = '';
            for (let i = 1; i < str.length; i++) {
                if (!isPowerOf2(i)) {
                    result += str[i];
                }
            }
            return result;
        };

        // Calculate parity for a specific position
        const calculateParity = (str: string, pos: number): boolean => {
            let count = 0;
            if (pos === 0) {
                // Position 0 checks all bits
                return str.split('').filter(bit => bit === '1').length % 2 === 0;
            }

            // For other positions, check alternating groups
            for (let i = pos; i < str.length; i += pos * 2) {
                for (let j = 0; j < pos && i + j < str.length; j++) {
                    if (str[i + j] === '1') count++;
                }
            }
            return count % 2 === 0;
        };

        // Find error position
        const findError = (str: string): number => {
            let errorPos = 0;
            for (let i = 1; i < str.length; i *= 2) {
                if (!calculateParity(str, i)) {
                    errorPos += i;
                }
            }
            return errorPos;
        };

        // Main decoding process
        let binaryStr = data;
        const overall = calculateParity(binaryStr, 0);
        const errorPos = findError(binaryStr);

        // If there's an error and overall parity fails, fix the error
        if (errorPos !== 0 && !overall) {
            const strArray = binaryStr.split('');
            strArray[errorPos] = strArray[errorPos] === '1' ? '0' : '1';
            binaryStr = strArray.join('');
        }

        // Get data bits and convert to decimal
        const dataBits = getDataBits(binaryStr);
        return parseInt(dataBits, 2);
    }
};


export async function main(ns: NS): Promise<void> {
    const inputs = [
        "1011000000000000100000000000001000010001011010100011011111111000",
        "00101100",
        "1001101010",
    ];
    const results = [4587141112, 12, 21];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}