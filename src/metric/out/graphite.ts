const url = "http://localhost:5000/publish/";

export function gauge(metrics: Metric[]) {
    if (metrics.length === 0) return;
    const packet = {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        method: "POST",
        body: JSON.stringify(metrics)
    };
    fetch(url + "gauge", packet);
}

export function delta(metrics: Metric[]) {
    if (metrics.length === 0) return;
    const packet = {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        method: "POST",
        body: JSON.stringify(metrics)
    };
    fetch(url + "delta", packet);
}

export function cumulative(metrics: Metric[]) {
    if (metrics.length === 0) return;
    const packet = {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        method: "POST",
        body: JSON.stringify(metrics)
    };
    fetch(url + "cumulative", packet);
}

export function test(metrics: Metric[]) {
    if (metrics.length === 0) return;
    const packet = {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        method: "POST",
        body: JSON.stringify(metrics)
    };
    fetch(url + "test", packet);
}
