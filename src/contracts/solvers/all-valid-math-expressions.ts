import { NS } from "@ns";

/**
 * You are given the following string which contains only digits between 0 and 9:
 * 
 * 35916794174
 * 
 * You are also given a target number of 47. Return all possible ways you can add the +(add), -(subtract), and *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)
 * 
 * The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:
 * 
 * ["35916794174", 47]
 * 
 * NOTE: The order of evaluation expects script operator precedence.
 * NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression.
 * 
 * Examples:
 * 
 * Input: digits = "123", target = 6
 * Output: ["1+2+3", "1*2*3"]
 * 
 * Input: digits = "105", target = 5
 * Output: ["1*0+5", "10-5"]
 */

export const contractType = "Find All Valid Math Expressions";
export const solver: ContractSolver = {
    solve(data: (string | number)[]): string[] {
        const num = data[0] as string;
        const target = data[1] as number;

        const result: string[] = [];

        function backtrack(
            pos: number,           // Current position in string
            expr: string,          // Current expression being built
            evalSoFar: number,     // Current evaluation result
            multed: number         // Last multiplied value (for precedence)
        ) {
            // Base case: reached end of string
            if (pos === num.length) {
                if (evalSoFar === target) {
                    result.push(expr);
                }
                return;
            }

            // Get current digit and its position for multi-digit numbers
            let curNum = 0;
            let start = pos;

            while (pos < num.length) {
                // Handle numbers with leading zeros
                if (start !== pos && num[start] === '0') {
                    break;
                }

                curNum = curNum * 10 + Number(num[pos]);

                // First number - no operator
                if (start === 0) {
                    backtrack(pos + 1, expr + curNum, curNum, curNum);
                } else {
                    // Addition
                    backtrack(pos + 1, expr + "+" + curNum, evalSoFar + curNum, curNum);

                    // Subtraction
                    backtrack(pos + 1, expr + "-" + curNum, evalSoFar - curNum, -curNum);

                    // Multiplication - need to handle precedence
                    backtrack(
                        pos + 1,
                        expr + "*" + curNum,
                        evalSoFar - multed + (multed * curNum),
                        multed * curNum
                    );
                }
                pos++;
            }
        }

        if (num.length === 0) {
            return result;
        }

        backtrack(0, "", 0, 0);
        return result;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        ["123", 6],
        ["105", 5],
    ];
    const results = [
        ["1+2+3", "1*2*3"],
        ["1*0+5", "10-5"],
    ];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        for (let j = 0; j < result.length; j++) {
            if (!results[i].includes(result[j]) || result.length !== results[i].length) {
                err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
                break;
            }
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}