
interface Contract {
    server: string;
    filename: string;
    type: string;
    guesses: number;
}

interface ContractSolver {
    solve(data: any): any;
}
