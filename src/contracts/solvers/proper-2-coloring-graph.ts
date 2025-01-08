import { NS } from "@ns";

/** 
 * You are given the following data, representing a graph:
 * [7,[[3,6],[2,4],[4,6],[1,2],[5,6],[1,6],[0,3],[2,3],[2,5]]]
 * Note that "graph", as used here, refers to the field of graph theory, and has no relation to statistics or plotting. 
 * The first element of the data represents the number of vertices in the graph. 
 * Each vertex is a unique number between 0 and 6. 
 * The next element of the data represents the edges of the graph. 
 * Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v]. 
 * Note that an edge [u,v] is the same as an edge [v,u], as order does not matter. 
 * You must construct a 2-coloring of the graph, meaning that you have to assign each vertex in the graph a "color", either 0 or 1, such that no two adjacent vertices have the same color. 
 * Submit your answer in the form of an array, where element i represents the color of vertex i. 
 * If it is impossible to construct a 2-coloring of the given graph, instead submit an empty array.
 * 
 * Examples:
 * 
 * Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
 * Output: [0, 0, 1, 1]
 * 
 * Input: [3, [[0, 1], [0, 2], [1, 2]]]
 * Output: []
 */

export const contractType = "Proper 2-Coloring of a Graph";
export const solver: ContractSolver = {
    solve(data: [number, number[][]]): number[] {
        const [n, edges] = data;
    
    // Create adjacency list
    const adj: number[][] = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
        adj[u].push(v);
        adj[v].push(u);
    }
    
    // Initialize colors array with -1 (uncolored)
    const colors: number[] = new Array(n).fill(-1);
    
    // Function to check if we can color the graph starting from vertex v
    const canColor = (vertex: number, color: number): boolean => {
        colors[vertex] = color;
        
        // Check all adjacent vertices
        for (const neighbor of adj[vertex]) {
            // If neighbor is uncolored, try coloring it with opposite color
            if (colors[neighbor] === -1) {
                if (!canColor(neighbor, 1 - color)) {
                    return false;
                }
            }
            // If neighbor is colored and has same color as current vertex
            else if (colors[neighbor] === color) {
                return false;
            }
        }
        
        return true;
    };
    
    // Try coloring each uncolored vertex
    for (let i = 0; i < n; i++) {
        if (colors[i] === -1) {
            if (!canColor(i, 0)) {
                return [];
            }
        }
    }
    
    return colors;
    }
};

export async function main(ns: NS): Promise<void> {
    const inputs = [
        [7,[[3,6],[2,4],[4,6],[1,2],[5,6],[1,6],[0,3],[2,3],[2,5]]],
        [4, [[0,2],[0,3],[1,2],[1,3]]],
        [3, [[0,1],[0,2],[1,2]]],
    ];
    const results = [[0,1,0,1,1,1,0], [0,0,1,1], []];

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