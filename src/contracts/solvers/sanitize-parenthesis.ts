import { NS } from "@ns";

/**
 * Given the following string:
 * 
 * (()a)a()()((a()aa((
 * 
 * remove the minimum number of invalid parentheses in order to validate the string. If there are multiple minimal ways to validate the string, provide all of the possible results. The answer should be provided as an array of strings. If it is impossible to validate the string the result should be an array with only an empty string.
 * 
 * IMPORTANT: The string may contain letters, not just parentheses. Examples:
 * "()())()" -> [()()(), (())()]
 * "(a)())()" -> [(a)()(), (a())()]
 * ")(" -> [""]
 */

export const contractType = "Sanitize Parentheses in Expression";
export const solver: ContractSolver = {
    solve(data: string): string[] {
        let result: string[] = [];
    let left = 0;
    let right = 0;
    for (const element of data) {
        if (element == '(') {
            left++;
        } else if (element == ')') {
            if (left > 0) {
                left--;
            } else {
                right++;
            }
        }
    }
    sanitizeParenthesisRecursive(data, 0, left, right, result);
    return result;
    }
};

function sanitizeParenthesisRecursive(input: string, start: number, left: number, right: number, result: string[]): void {
    if (left == 0 && right == 0) {
        if (isValid(input)) {
            result.push(input);
        }
        return;
    }
    for (let i = start; i < input.length; i++) {
        if (i > start && input[i] == input[i - 1]) {
            continue;
        }
        if (input[i] == '(' || input[i] == ')') {
            let newInput = input.substring(0, i) + input.substring(i + 1);
            if (right > 0 && input[i] == ')') {
                sanitizeParenthesisRecursive(newInput, i, left, right - 1, result);
            } else if (left > 0 && input[i] == '(') {
                sanitizeParenthesisRecursive(newInput, i, left - 1, right, result);
            }
        }
    }
}

function isValid(input: string): boolean {
    let count = 0;
    for (const element of input) {
        if (element == '(') {
            count++;
        } else if (element == ')') {
            count--;
        }
        if (count < 0) {
            return false;
        }
    }
    return count == 0;
}

export async function main(ns: NS): Promise<void> {
    const inputs = [
        "()())()",
        "(a)())()",
        ")(",
    ];
    const results = [["(())()", "()()()"], ["(a())()", "(a)()()"], [""]];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        for (const res of result) {
            if (!results[i].includes(res)) {
                err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
                break;
            }
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}