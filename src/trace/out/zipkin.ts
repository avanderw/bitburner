const url = "http://localhost:9411/api/v2/spans";

export function zipkin(spans:Span[]) {
    const packet = {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        method: "POST",
        body: JSON.stringify(spans)
    };
    fetch(url, packet);
}
