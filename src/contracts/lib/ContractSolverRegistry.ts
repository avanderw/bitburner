import * as AlgorithmicStockTrader01 from "../solvers/algorithmic-stock-trader-01";
import * as AlgorithmicStockTrader02 from "../solvers/algorithmic-stock-trader-02";
import * as AlgorithmicStockTrader03 from "../solvers/algorithmic-stock-trader-03";
import * as AlgorithmicStockTrader04 from "../solvers/algorithmic-stock-trader-04";
import * as AllValidMathExpressions from "../solvers/all-valid-math-expressions";
import * as ArrayJumping01 from "../solvers/array-jumping-01";
import * as ArrayJumping02 from "../solvers/array-jumping-02";
import * as Compression01RLECompression from "../solvers/compression-01-RLE-compression";
import * as Compression02LZDecompression from "../solvers/compression-02-LZ-decompression";
import * as Compression03LZCompression from "../solvers/compression-03-LZ-compression";
import * as Encryption01CaesarCipher from "../solvers/encryption-01-caesar-cipher";
import * as Encryption02VigenereCipher from "../solvers/encryption-02-vigenere-cipher";
import * as GenerateIpAddresses from "../solvers/generate-ip-addresses";
import * as HammingCodesFromBinary from "../solvers/hamming-codes-from-binary";
import * as HammingCodesFromInteger from "../solvers/hamming-codes-from-integer";
import * as LargestPrimeFactor from "../solvers/largest-prime-factor";
import * as MergeOverlappingIntervals from "../solvers/merge-overlapping-intervals";
import * as MinPathSumTriangle from "../solvers/min-path-sum-triangle";
import * as Proper2ColoringGraph from "../solvers/proper-2-coloring-graph";
import * as SanitizeParenthesis from "../solvers/sanitize-parenthesis";
import * as ShortestPath from "../solvers/shortest-path";
import * as SpiralMatrix from "../solvers/spiral-matrix";
import * as SquareRoot from "../solvers/square-root";
import * as SubarrayWithMaximumSum from "../solvers/subarray-with-maximum-sum";
import * as TotalWaysToSum01 from "../solvers/total-ways-to-sum-01";
import * as TotalWaysToSum02 from "../solvers/total-ways-to-sum-02";
import * as UniqueGridPaths01 from "../solvers/unique-grid-paths-01";
import * as UniqueGridPaths02 from "../solvers/unique-grid-paths-02";

interface ContractSolver {
    solve(data: any): any;
}

// Contract solver registry with plugin loading
export class ContractSolverRegistry {
    private solvers: Map<string, ContractSolver> = new Map();

    constructor() {
        this.register(AlgorithmicStockTrader01.contractType, AlgorithmicStockTrader01.solver);
        this.register(AlgorithmicStockTrader02.contractType, AlgorithmicStockTrader02.solver);
        this.register(AlgorithmicStockTrader03.contractType, AlgorithmicStockTrader03.solver);
        this.register(AlgorithmicStockTrader04.contractType, AlgorithmicStockTrader04.solver);
        this.register(AllValidMathExpressions.contractType, AllValidMathExpressions.solver);
        this.register(ArrayJumping01.contractType, ArrayJumping01.solver);
        this.register(ArrayJumping02.contractType, ArrayJumping02.solver);
        this.register(Compression01RLECompression.contractType, Compression01RLECompression.solver);
        this.register(Compression02LZDecompression.contractType, Compression02LZDecompression.solver);
        // this.register(Compression03LZCompression.contractType, Compression03LZCompression.solver);
        this.register(Encryption01CaesarCipher.contractType, Encryption01CaesarCipher.solver);
        this.register(Encryption02VigenereCipher.contractType, Encryption02VigenereCipher.solver);
        this.register(GenerateIpAddresses.contractType, GenerateIpAddresses.solver);
        this.register(HammingCodesFromBinary.contractType, HammingCodesFromBinary.solver);
        this.register(HammingCodesFromInteger.contractType, HammingCodesFromInteger.solver);
        this.register(LargestPrimeFactor.contractType, LargestPrimeFactor.solver);
        this.register(MergeOverlappingIntervals.contractType, MergeOverlappingIntervals.solver);
        this.register(MinPathSumTriangle.contractType, MinPathSumTriangle.solver);
        this.register(Proper2ColoringGraph.contractType, Proper2ColoringGraph.solver);
        this.register(SanitizeParenthesis.contractType, SanitizeParenthesis.solver);
        this.register(ShortestPath.contractType, ShortestPath.solver);
        this.register(SpiralMatrix.contractType, SpiralMatrix.solver);
        this.register(SquareRoot.contractType, SquareRoot.solver);
        this.register(SubarrayWithMaximumSum.contractType, SubarrayWithMaximumSum.solver);
        this.register(TotalWaysToSum01.contractType, TotalWaysToSum01.solver);
        this.register(TotalWaysToSum02.contractType, TotalWaysToSum02.solver);
        this.register(UniqueGridPaths01.contractType, UniqueGridPaths01.solver);
        this.register(UniqueGridPaths02.contractType, UniqueGridPaths02.solver);
    }

    register(contractType: string, solver: ContractSolver): void {
        this.solvers.set(contractType, solver);
    }

    getSolver(contractType: string): ContractSolver | undefined {
        return this.solvers.get(contractType);
    }

    hasSolver(contractType: string): boolean {
        return this.solvers.has(contractType);
    }

    getLoadedTypes(): string[] {
        return Array.from(this.solvers.keys());
    }
}
