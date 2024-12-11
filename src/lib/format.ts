/**
 * ███████╗░█████╗░██████╗░███╗░░░███╗░█████╗░████████╗
 * ██╔════╝██╔══██╗██╔══██╗████╗░████║██╔══██╗╚══██╔══╝
 * █████╗░░██║░░██║██████╔╝██╔████╔██║███████║░░░██║░░░
 * ██╔══╝░░██║░░██║██╔══██╗██║╚██╔╝██║██╔══██║░░░██║░░░
 * ██║░░░░░╚█████╔╝██║░░██║██║░╚═╝░██║██║░░██║░░░██║░░░
 * ╚═╝░░░░░░╚════╝░╚═╝░░╚═╝╚═╝░░░░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░
 */
 
 export function box(title: string, lines: string[], opts?: { pattern?: string; minWidth?: number }): string {
    const defaultPattern = "┌┤├─┐│└┘";
    opts = opts || { pattern: defaultPattern, minWidth: 0 };

    const minWidth = opts.minWidth || 0;
    const width = Math.max(
        title.length,
        lines.map(c => c.length).reduce((a, b) => Math.max(a, b), 0),
        minWidth
    );

    const pattern = opts.pattern || defaultPattern;
    let out =
        pattern.charAt(0) +
        pattern.charAt(1) +
        (title + pattern.charAt(2)).padEnd(width + 1, pattern.charAt(3)) +
        pattern.charAt(4) +
        "\n";
    lines.forEach(line => (out += pattern.charAt(5) + " " + line.padEnd(width, " ") + " " + pattern.charAt(5) + "\n"));
    out += pattern.charAt(6) + "".padStart(width + 2, pattern.charAt(3)) + pattern.charAt(7) + "\n";

    return out;
}

export function form(lines: { label: string; value: string }[]): string {
    const maxLabel = lines.map(line => line.label.length).reduce((a, b) => Math.max(a, b), 0);
    let out = "";
    lines.forEach(line => (out += `${line.label.padStart(maxLabel)}: ${line.value}\n`));
    return out;
}

export function progress(value: number, max: number): string {
    const ratio = value / max;
    let out = "[";
    out += ratio > 0.05 ? "█" : "_";
    out += ratio > 0.15 ? "█" : "_";
    out += ratio > 0.25 ? "█" : "_";
    out += ratio > 0.35 ? "█" : "_";
    out += ratio > 0.45 ? "█" : "_";
    out += ratio > 0.55 ? "█" : "_";
    out += ratio > 0.65 ? "█" : "_";
    out += ratio > 0.75 ? "█" : "_";
    out += ratio > 0.85 ? "█" : "_";
    out += ratio > 0.95 ? "█" : "_";
    out += "]";

    return out;
}
