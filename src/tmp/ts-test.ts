import { NS } from "/bitburner/NetscriptDefinitions";
import { min, max, range, size, sum, mean, median, mode, standardDeviation, variance, interquartileRange, kurtosis, skewness, movingAverage, linearWeightedMovingAverage, iTrend, iterativeNoiseRemoval, noiseData, arMaxEntropy, arLeastSquares } from "/usr/lib/timeseries-analysis";
import { data } from "/var/timeseries-data";
import { plot } from "/lib/asciichart";

export async function main(ns: NS) {
    ns.tprint(`data: ${data.join(" ")}`);

    ns.tprint(`min: ${min(data)}`);
    ns.tprint(`max: ${max(data)}`);
    ns.tprint(`range: ${range(data)}`);
    ns.tprint(`size: ${size(data)}`);
    ns.tprint(`sum: ${sum(data)}`);
    ns.tprint(`mean: ${mean(data)}`);
    ns.tprint(`median: ${median(data)}`);
    ns.tprint(`mode: ${mode(data)}`);
    ns.tprint(`standard deviation: ${standardDeviation(data)}`);
    ns.tprint(`variance: ${variance(data)}`);
    ns.tprint(`skewness: ${skewness(data)}`);
    ns.tprint(`kurtosis: ${kurtosis(data)}`);
    ns.tprint(`interquartile range: ${interquartileRange(data)}`);

    ns.tprint(`moving average: ${movingAverage(data, 5).join(" ")}`);
    ns.tprint(`linear weighted moving average: ${linearWeightedMovingAverage(data, 5).join(" ")}`);
    
    ns.tail();
    ns.print(plot([data]));
    ns.print(plot([movingAverage(data, 5)]));
    ns.print(plot([linearWeightedMovingAverage(data, 5)]));
    ns.print(plot([iTrend(data, .75)]));
    ns.print(plot([iterativeNoiseRemoval(data, 2)]));
    ns.print(plot([noiseData(data, iterativeNoiseRemoval(data, 2))]));

    ns.print(`arMaxEntropy: ${arMaxEntropy(data, 5)}`);
    ns.print(`arLeastSquares: ${arLeastSquares(data, 5)}`);
}