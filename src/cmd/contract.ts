import { NS } from "../bitburner/NetscriptDefinitions";
import { scan } from "/util/scan";

export async function main(ns: NS) {
    const number = new Intl.NumberFormat();
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    });
    const args = ns.flags([
        ["debug", false],
        ["dry", false],
        ["help", false],
        ["h", false]
    ]);
    if (args.help || args.h) {
        ns.tprint(`USAGE: run ${ns.getScriptName()} [optional] <required>`);
        ns.tprint("Find and complete coding contracts.");
        ns.tprint("      --dry       Log actions instead of make them.");
        ns.tprint("      --debug     Enable debug logging.");
        ns.tprint("  -h, --help      Shows this help message and exit.");
        return;
    }

    if (!args.debug) {
        ns.disableLog("ALL");
    }

    const ALGO: { [name: string]: (data: any) => any } = {
        "Find Largest Prime Factor": largestPrimeFactor,
        "Algorithmic Stock Trader I": stockTrader01,
        "Algorithmic Stock Trader II": stockTrader02,
        "Algorithmic Stock Trader III": data => -1,
        "Algorithmic Stock Trader IV": data => -1,
        "Minimum Path Sum in a Triangle": minPathSumTriangle,
        "Generate IP Addresses": generateIpAddresses,
        "Find All Valid Math Expressions": data => -1,
        "Sanitize Parentheses in Expression": data => -1,
        "Unique Paths in a Grid I": uniquePathsinGrid01,
        "Unique Paths in a Grid II": uniquePathsinGrid02,
        "Merge Overlapping Intervals": mergeOverlappingIntervals,
        "Subarray with Maximum Sum": maxSubArraySum,
        "Spiralize Matrix": spiralMatrix,
        "Total Ways to Sum": totalWaysToSum,
        "Array Jumping Game": arrayJumpingGame
    };

    scan(ns).forEach(s =>
        s.files.forEach(f => {
            if (f.endsWith("cct")) {
                const type = ns.codingcontract.getContractType(f, s.hostname);
                const description = ns.codingcontract.getDescription(f, s.hostname);
                const data = ns.codingcontract.getData(f, s.hostname);
                const tries = ns.codingcontract.getNumTriesRemaining(f, s.hostname);

                ns.print(
                    `\n//${s.hostname}/${f} (${type}) [${tries}]\n` +
                        `\nDescription: ${description}\n` +
                        `\nData: ${data}`
                );

                const answer = ALGO[type](data);

                if (args.dry || answer === -1) {
                    ns.print(`Answer: Not implemented`);
                } else {
                    if (!ns.codingcontract.attempt(answer, f, s.hostname)) {
                        ns.tail();
                        throw new Error("Bug in the algorithm. Fix!");
                    }
                    ns.tprintf(`//${s.hostname}/${f} (${type}) [${tries}] Claimed reward`);
                }
            }
        })
    );
}

function stockTrader01(data: number[]): number {
    let max = 0;
    for (let i = 0; i < data.length; i++) {
        const buy = data[i];
        const sell = Math.max(...data.slice(i + 1));
        const profit = sell - buy;
        max = Math.max(profit, max);
    }
    return max;
}

function stockTrader02(data: number[]): number {
    let profit = 0;
    for (let i = 1; i < data.length; i++) {
        let sub = data[i] - data[i - 1];
        if (sub > 0) {
            profit += sub;
        }
    }
    return profit;
}

function largestPrimeFactor(num: number): number {
    const factors = [];
    let d = 2;
    let n = num;
    while (n > 1) {
        while (n % d == 0) {
            factors.push(d);
            n /= d;
        }
        d++;
    }

    return Math.max(...factors);
}

function spiralMatrix(matrix: number[][]): number[] {
    let dY = 0;
    let dX = 1;
    let y = 0;
    let x = 0;
    const ans = [];
    const rowLen = matrix.length;
    const colLen = matrix[0].length;
    const visited = [];
    for (let r = 0; r < rowLen; r++) {
        const row = [];
        for (let c = 0; c < colLen; c++) {
            row.push(false);
        }
        visited.push(row);
    }

    while (visited.some(r => r.some(c => !c))) {
        visited[y][x] = true;
        ans.push(matrix[y][x]);

        console.log(`[${x},${y}] ${ans}`);

        const nX = x + dX;
        const nY = y + dY;
        if (nX === colLen || (dX === 1 && visited[nY][nX])) {
            dY = 1;
            dX = 0;
        } else if (nY === rowLen || (dY === 1 && visited[nY][nX])) {
            dY = 0;
            dX = -1;
        } else if (nX < 0 || (dX === -1 && visited[nY][nX])) {
            dY = -1;
            dX = 0;
        } else if (nY < 0 || (dY === -1 && visited[nY][nX])) {
            dY = 0;
            dX = 1;
        }

        y += dY;
        x += dX;
    }

    return ans;
}

function maxSubArraySum(data: number[]): number {
    let max_so_far = data[0];
    let curr_max = data[0];

    for (let i = 1; i < data.length; i++) {
        curr_max = Math.max(data[i], curr_max + data[i]);
        max_so_far = Math.max(max_so_far, curr_max);
    }

    return max_so_far;
}

function arrayJumpingGame(nums: number[]): number {
    let maxIdx = 0;
    for (let idx = 0; idx < nums.length && idx <= maxIdx; idx++) {
        maxIdx = Math.max(idx + nums[idx], maxIdx);
    }

    return maxIdx >= nums.length - 1 ? 1 : 0;
}

function generateIpAddresses(data: string): string[] {
    let ret = [];
    for (let a = 1; a <= 3; ++a) {
        for (let b = 1; b <= 3; ++b) {
            for (let c = 1; c <= 3; ++c) {
                for (let d = 1; d <= 3; ++d) {
                    if (a + b + c + d === data.length) {
                        let A = parseInt(data.substring(0, a), 10);
                        let B = parseInt(data.substring(a, a + b), 10);
                        let C = parseInt(data.substring(a + b, a + b + c), 10);
                        let D = parseInt(data.substring(a + b + c, a + b + c + d), 10);
                        if (A <= 255 && B <= 255 && C <= 255 && D <= 255) {
                            let ip = [A.toString(), ".", B.toString(), ".", C.toString(), ".", D.toString()].join("");
                            if (ip.length === data.length + 3) {
                                ret.push(ip);
                            }
                        }
                    }
                }
            }
        }
    }
    return ret;
}

function minPathSumTriangle(data: number[][]): number {
    let n = data.length;
    let dp = data[n - 1].slice();
    for (let i = n - 2; i > -1; --i) {
        for (let j = 0; j < data[i].length; ++j) {
            dp[j] = Math.min(dp[j], dp[j + 1]) + data[i][j];
        }
    }
    return dp[0];
}

function mergeOverlappingIntervals(intervals: number[][]): number[][] {
    intervals.sort((a, b) => a[0] - b[0]);
    let result: number[][] = [];
    let start = intervals[0][0];
    let end = intervals[0][1];
    for (let i = 0; i < intervals.length; i++) {
        let interval = intervals[i];
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

function totalWaysToSum(data: number): number {
    let ways = [1];
    ways.length = data + 1;
    ways.fill(0, 1);
    for (let i = 1; i < data; ++i) {
        for (let j = i; j <= data; ++j) {
            ways[j] += ways[j - i];
        }
    }
    return ways[data];
}

function uniquePathsinGrid01(data: number[]) {
    let n = data[0]; // Number of rows
    let m = data[1]; // Number of columns
    let currentRow = [];
    currentRow.length = n;
    for (let i = 0; i < n; i++) {
        currentRow[i] = 1;
    }
    for (let row = 1; row < m; row++) {
        for (let i = 1; i < n; i++) {
            currentRow[i] += currentRow[i - 1];
        }
    }
    return currentRow[n - 1];
}

function uniquePathsinGrid02(data: number[][]) {
    let obstacleGrid = [];
    obstacleGrid.length = data.length;
    for (let i = 0; i < obstacleGrid.length; ++i) {
        obstacleGrid[i] = data[i].slice();
    }
    for (let i = 0; i < obstacleGrid.length; i++) {
        for (let j = 0; j < obstacleGrid[0].length; j++) {
            if (obstacleGrid[i][j] == 1) {
                obstacleGrid[i][j] = 0;
            } else if (i == 0 && j == 0) {
                obstacleGrid[0][0] = 1;
            } else {
                obstacleGrid[i][j] = (i > 0 ? obstacleGrid[i - 1][j] : 0) + (j > 0 ? obstacleGrid[i][j - 1] : 0);
            }
        }
    }
    return obstacleGrid[obstacleGrid.length - 1][obstacleGrid[0].length - 1];
}
