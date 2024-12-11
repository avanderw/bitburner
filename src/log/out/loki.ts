const url = "http://localhost:3100/loki/api/v1/push";

export function loki(logs:Logs) {
    const packet = {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        method: "POST",
        body: JSON.stringify(logs)
    };
    fetch(url, packet);
}
