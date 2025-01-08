import { NS } from "@ns";

/** Add your description here */

export const contractType = "Spiralize Matrix";
export const solver: ContractSolver = {
    solve(data: number[][]): number[] {
        let dY = 0;
        let dX = 1;
        let y = 0;
        let x = 0;
        const ans = [];
        const rowLen = data.length;
        const colLen = data[0].length;
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
            ans.push(data[y][x]);

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
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ],
        [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
        ],
    ];
    const results = [[1, 2, 3, 6, 9, 8, 7, 4, 5], [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        for (let j = 0; j < results[i].length; j++) {
            if (result[j] !== results[i][j]) {
                err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
                break;
            }
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}