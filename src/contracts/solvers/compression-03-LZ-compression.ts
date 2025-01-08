import { NS } from "@ns";

/**
 * Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data. 
 * In this variant of LZ, data is encoded in two types of chunk. 
 * Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data, which is either:
 * 
 * 1. Exactly L characters, which are to be copied directly into the uncompressed data.
 * 2. A reference to an earlier part of the uncompressed data. 
 *    To do this, the length is followed by a second ASCII digit X: each of the L output characters is a copy of the 
 *    character X places before it in the uncompressed data.
 * 
 * For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk. 
 * The two chunk types alternate, starting with type 1, and the final chunk may be of either type.
 * 
 * You are given the following input string:
 *     v8jjjjjjjjjjjjjjjjjA1sjA1sjA1sjSjAnSjAAnSjAj6IrnSjAj6Ifmpzblpzblm5zblpzU5zblpzU5ZXsp
 * Encode it using Lempel-Ziv encoding with the minimum possible output length.
 * 
 * Examples (some have other possible encodings of minimal length):
 *     abracadabra     ->  7abracad47
 *     mississippi     ->  4miss433ppi
 *     aAAaAAaAaAA     ->  3aAA53035
 *     2718281828      ->  627182844
 *     abcdefghijk     ->  9abcdefghi02jk
 *     aaaaaaaaaaaa    ->  3aaa91
 *     aaaaaaaaaaaaa   ->  1a91031
 *     aaaaaaaaaaaaaa  ->  1a91041
 */

export const contractType = "Compression III: LZ Compression";
export const solver: ContractSolver = {
    solve(data: string): string {
        let result = "";
        let pos = 0;
        let isDirectChunk = true;

        while (pos < data.length) {
            if (isDirectChunk) {
                // Try to find the optimal direct chunk length
                let bestDirectLength = Math.min(9, data.length - pos);
                let bestTotalLength = Infinity;
                let chosenLength = bestDirectLength;

                for (let directLength = 1; directLength <= bestDirectLength; directLength++) {
                    const remainingPos = pos + directLength;
                    if (remainingPos < data.length) {
                        const [matchLength, matchPos] = findLongestMatch(data, remainingPos);
                        const totalLength = directLength + matchLength;
                        if (totalLength > bestTotalLength) continue;
                        if (totalLength < bestTotalLength || directLength < chosenLength) {
                            bestTotalLength = totalLength;
                            chosenLength = directLength;
                        }
                    }
                }

                // Add the direct chunk
                result += chosenLength.toString();
                result += data.slice(pos, pos + chosenLength);
                pos += chosenLength;
            } else {
                // Find the best back-reference
                const [matchLength, matchPos] = findLongestMatch(data, pos);
                if (matchLength === 0) {
                    result += "0";
                    isDirectChunk = !isDirectChunk;
                    continue;
                }

                // Limit length to 9 and encode
                const encodedLength = Math.min(9, matchLength);
                result += encodedLength.toString() + matchPos.toString();
                pos += encodedLength;
            }

            isDirectChunk = !isDirectChunk;
        }

        return result;
    }
};

function findLongestMatch(data: string, currentPos: number): [number, number] {
    let maxLength = 0;
    let bestPosition = 0;

    // Look back through the string for matches
    for (let pos = 1; pos <= currentPos; pos++) {
        let length = 0;
        while (currentPos + length < data.length &&
            data[currentPos + length] === data[currentPos - pos + (length % pos)]) {
            length++;
        }

        if (length > maxLength) {
            maxLength = length;
            bestPosition = pos;
        }
    }

    return [maxLength, bestPosition];
}

export async function main(ns: NS): Promise<void> {
    const inputs = [
        "v8jjjjjjjjjjjjjjjjjA1sjA1sjA1sjSjAnSjAAnSjAj6IrnSjAj6Ifmpzblpzblm5zblpzU5zblpzU5ZXsp",
        "abracadabra",
        "mississippi",
        "aAAaAAaAaAA",
        "2718281828",
        "abcdefghijk",
        "aaaaaaaaaaaa",
        "aaaaaaaaaaaaa",
        "aaaaaaaaaaaaaa",
    ];
    const results = [
        "v8jA1sjA1sjA1sjSjAnSjAAnSjAj6IrnSjAj6Ifmpzblpzblm5zblpzU5zblpzU5ZXsp",
        "7abracad47",
        "4miss433ppi",
        "3aAA53035",
        "627182844",
        "9abcdefghi02jk",
        "3aaa91",
        "1a91031",
        "1a91041",
    ];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}