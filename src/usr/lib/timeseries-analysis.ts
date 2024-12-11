/**
 * Version 1: Descriptive Statisics
 * 0. Min, Max
 * 1. Mean, Median, Mode
 * 2. Standard Deviation, Variance, Skewness, Kurtosis
 *
 * Version 2: Smoothing
 * 1. Moving average
 * 2. Linear Weighted Moving Average
 * 3. John Ehlers iTrend
 *
 * Version 3: Noise Removal
 * 0. Noise removal
 * 1. Noise separation
 *
 * Version 4: Forecasting
 * 0. Auto-Regression
 *
 * Version x: Extensions
 * 0. Bollinger Bands
 * 1. MACD
 * 2. RSI
 * 3. KDJ
 * 4. Exponential Weighted Moving Average
 *
 * Credits:
 * https://www.npmjs.com/package/timeseries-analysis
 */

export const version = "2.3-pre-alpha";

export function min(data: number[]): number {
    return Math.min(...data);
}

export function max(data: number[]): number {
    return Math.max(...data);
}

export function size(data: number[]): number {
    return data.length;
}

export function sum(data: number[]): number {
    return data.reduce((a, b) => a + b, 0);
}

export function frequency(data: number[]): { key: number; count: number }[] {
    const freq: { key: number; count: number }[] = [];
    data.forEach(d => {
        const index = freq.findIndex(f => f.key === d);
        if (index === -1) {
            freq.push({ key: d, count: 1 });
        } else {
            freq[index].count++;
        }
    });
    return freq;
}

export function mode(data: number[]): number[] {
    const freq = frequency(data);
    const maxCount = freq.map(f => f.count).reduce((a, b) => Math.max(a, b), 0);
    const modes = freq.filter(f => f.count === maxCount);
    return modes.map(m => m.key);
}

export function mean(data: number[]): number {
    return data.reduce((a, b) => a + b, 0) / data.length;
}

export function median(data: number[]): number {
    const sorted = data.slice(0).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        return sorted[mid];
    }
}

// sample standard deviation
export function standardDeviation(data: number[]): number {
    return Math.sqrt(variance(data));
}

// sample variance
export function variance(data: number[]): number {
    const m = mean(data);
    const deviations = data.map(d => Math.pow(d - m, 2));
    return sum(deviations) / (data.length - 1);
}

// population skewness
export function skewness(data: number[]): number {
    const m = mean(data);
    const deviations = data.map(d => Math.pow(d - m, 3));
    return sum(deviations) / (data.length * Math.pow(standardDeviation(data), 3));
}

// population kurtosis
export function kurtosis(data: number[]): number {
    const m = mean(data);
    const deviations = data.map(d => Math.pow(d - m, 4));
    return sum(deviations) / (data.length * Math.pow(standardDeviation(data), 4));
}

export function range(data: number[]): number {
    return Math.max(...data) - Math.min(...data);
}

export function getPercentile(data: number[], percentile: number): number {
    const sorted = data.slice(0).sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile);
    return sorted[index];
}

export function interquartileRange(data: number[]): number {
    return getPercentile(data, 0.75) - getPercentile(data, 0.25);
}

export function movingAverage(data: number[], window: number): number[] {
    const result: number[] = data.slice(0, window);
    for (let i = window; i < data.length; i++) {
        let s = 0;
        for (let j = 0; j < window; j++) {
            s += data[i - j];
        }
        result.push(s / window);
    }
    return result;
}

export function linearWeightedMovingAverage(data: number[], window: number): number[] {
    const result: number[] = data.slice(0, window);
    for (let i = window; i < data.length; i++) {
        let s = 0;
        for (let j = 0; j < window; j++) {
            s += data[i - j] * (j + 1);
        }
        result.push(s / ((window * (window + 1)) / 2));
    }
    return result;
}

/**
 * Ehlers instantaneous trend indicator
 * @param data
 * @param alpha [0;1] Sensitivity constant, higher values are more sensitive to shorter-duration trends.
 */
export function iTrend(data: number[], alpha: number): number[] {
    const result: number[] = data.slice(0, 3);
    for (let i = 3; i < data.length; i++) {
        if (i < 7) {
            result.push((data[i] + 2 * data[i - 1] + data[i - 2]) / 4);
        } else {
            result.push(
                (alpha - (alpha * alpha) / 4) * data[i] +
                    0.5 * alpha * alpha * data[i - 1] -
                    (alpha - 0.75 * alpha * alpha) * data[i - 2] +
                    2 * (1 - alpha) * data[i - 1] -
                    (1 - alpha) * (1 - alpha) * data[i - 2]
            );
        }
    }
    return result;
}

// Iterative Noise Removal
export function iterativeNoiseRemoval(data: number[], iterations: number): number[] {
    const result: number[] = data.slice(0);
    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 2; i < result.length; i++) {
            result[i - 1] = (result[i - 2] + result[i]) / 2;
        }
    }
    return result;
}

// Noise data
export function noiseData(data: number[], smoothed: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
        result.push(data[i] - smoothed[i]);
    }
    return result;
}

// Autoregression method: MaxEntropy
export function arMaxEntropy(data: number[], degree: number): number[] {
    const pef = fill(0, data.length);
    const per = fill(0, data.length);
    const h = fill(0, data.length);
    const g = fill(0, degree + 2);

    for (let n = 1; n <= degree; n++) {
        var sn = 0.0;
        var sd = 0.0;
        let jj = length - n;

        for (let j = 0; j < jj; j++) {
            const t1 = data[j + n] + pef[j];
            const t2 = data[j] + per[j];
            sn -= 2.0 * t1 * t2;
            sd += t1 * t1 + t2 * t2;
        }

        const t1 = (g[n] = sn / sd);
        if (n != 1) {
            for (let j = 1; j < n; j++) {
                h[j] = g[j] + t1 * g[n - j];
            }
            for (let j = 1; j < n; j++) {
                g[j] = h[j];
            }
            jj--;
        }

        for (let j = 0; j < jj; j++) {
            per[j] += t1 * pef[j] + t1 * data[j + n];
            pef[j] = pef[j + 1] + t1 * per[j + 1] + t1 * data[j + 1];
        }
    }

    const coef = [];
    for (let n = 0; n < degree; n++) {
        coef[n] = g[n + 1];
    }
    return coef;
}

// Autoregression method: LeastSquares
export function arLeastSquares(data: number[], degree: number): number[] {
    const matrix = [];
    for (let i = 0; i < degree; i++) {
        matrix[i] = fill(0, degree);
    }

    const coefficients = [];
    for (let i = 0; i < degree; i++) {
        coefficients[i] = 0.0;
        for (let j = 0; j < degree; j++) {
            matrix[i][j] = 0.0;
        }
    }
    for (let i = degree - 1; i < length - 1; i++) {
        const hi = i + 1;
        for (let j = 0; j < degree; j++) {
            const hj = i - j;
            coefficients[j] += data[hi] * data[hj];
            for (let k = j; k < degree; k++) {
                matrix[j][k] += data[hj] * data[i - k];
            }
        }
    }
    for (let i = 0; i < degree; i++) {
        coefficients[i] /= length - degree;
        for (let j = i; j < degree; j++) {
            matrix[i][j] /= length - degree;
            matrix[j][i] = matrix[i][j];
        }
    }

    return coefficients;
    // return gaussianSolver(matrix, coefficients, degree);
}

/**
 * Gaussian elimination solver.
 * Use the coefficients from the Least Square method and make it into the real AR coefficients.
 */
export function gaussianSolver(mat: number[][], vec: number[], n: number): number[] {
    let mswap;
    let vswap;
    for (let i = 0; i < n - 1; i++) {
        let max = Math.abs(mat[i][i]);
        let maxi = i;
        let h;
        for (let j = i + 1; j < n; j++) {
            if ((h = Math.abs(mat[j][i])) > max) {
                max = h;
                maxi = j;
            }
        }
        if (maxi != i) {
            mswap = mat[i];
            mat[i] = mat[maxi];
            mat[maxi] = mswap;
            vswap = vec[i];
            vec[i] = vec[maxi];
            vec[maxi] = vswap;
        }

        const hvec = mat[i];
        const pivot = hvec[i];
        if (Math.abs(pivot) == 0.0) {
            throw new Error("Singular matrix - fatal!");
        }
        for (let j = i + 1; j < n; j++) {
            const q = -mat[j][i] / pivot;
            mat[j][i] = 0.0;
            for (let k = i + 1; k < n; k++) {
                mat[j][k] += q * hvec[k];
            }
            vec[j] += q * vec[i];
        }
    }
    vec[n - 1] /= mat[n - 1][n - 1];
    for (let i = n - 2; i >= 0; i--) {
        const hvec = mat[i];
        for (let j = n - 1; j > i; j--) {
            vec[i] -= hvec[j] * vec[j];
        }
        vec[i] /= hvec[i];
    }

    return vec;
}

function fill(value: number, length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < length; i++) {
        result.push(value);
    }
    return result;
}
