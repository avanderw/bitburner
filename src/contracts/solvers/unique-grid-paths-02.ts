import { NS } from "@ns";

/** Add your description here */

export const contractType = "Unique Paths in a Grid II";
export const solver: ContractSolver = {
    solve(data: number[][]): number {
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
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [[0,0],[0,0],[0,0],[0,1],[0,0],[1,0]],
    ];
    const results = [1];

    let err = "";
    for (let i = 0; i < inputs.length; i++) {
        const result = solver.solve(inputs[i]);
        if (result !== results[i]) {
            err += `given ${inputs[i]}, expected ${results[i]}, got ${result}\n`;
        }
    }

    ns.tprint(err === "" ? "All tests passed" : "ERROR: Some tests failed\n" + err);
}