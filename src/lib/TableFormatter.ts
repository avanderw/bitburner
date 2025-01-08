interface TableFormatOptions {
    title?: string;
    numberFormat?: Intl.NumberFormat;
    limit?: number;
}

export class TableFormatter {
    private static readonly DEFAULT_NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    format<T extends object>(data: T[], options: TableFormatOptions = {}): string {
        if (data.length === 0) return "";

        const {
            title = "",
            numberFormat = TableFormatter.DEFAULT_NUMBER_FORMAT,
            limit = 0
        } = options;

        const columns = Object.keys(data[0]);
        const rows = data.map(item => Object.values(item));
        const columnWidths = this.calculateColumnWidths(columns, rows, numberFormat, limit);
        if (title.length > columnWidths.reduce((a, b) => a + b, (columnWidths.length - 1) * 3)) {
            title.substring(0, columnWidths.reduce((a, b) => a + b, (columnWidths.length - 1) * 3)-3) + "...";
        }

        const tableLines = [];
        if (title !== "") {
            tableLines.push(...[
                this.createBorderLine("┌─", "─", "───", "─┐", columnWidths),
                this.createTitleLine(title, columnWidths),
                this.createBorderLine("├─", "─", "─┬─", "─┤", columnWidths)
            ]);
        } else {
            tableLines.push(this.createBorderLine("┌─", "─", "─┬─", "─┐", columnWidths));
        }

        tableLines.push(...[
            this.createHeaderLine(columns, columnWidths),
            this.createBorderLine("├─", "─", "─┼─", "─┤", columnWidths),
            ...this.createBodyLines(rows, columnWidths, numberFormat, limit),
            this.createBorderLine("├─", "─", "─┴─", "─┤", columnWidths),
            this.createFooterLine("Showing " + (limit === 0 ? rows.length : Math.min(limit, rows.length)) + " of " + numberFormat.format(rows.length) + " rows", columnWidths),
            this.createBorderLine("└─", "─", "───", "─┘", columnWidths),
        ]);

        return tableLines.join("\n");
    }

    private calculateColumnWidths(columns: string[], rows: any[][], numberFormat: Intl.NumberFormat, limit: number): number[] {
        return columns.map((col, index) => {
            const headerLength = col.length;
            const maxDataLength = Math.max(...rows.slice(0, limit || undefined).map(row => {
                const value = row[index];
                return typeof value === 'number'
                    ? numberFormat.format(value).length
                    : this.cleanString(value.toString()).length;
            }));
            return Math.max(headerLength, maxDataLength);
        });
    }

    private cleanString(str: string): string {
        return str
            .replaceAll(/%%/g, " ")
            .replaceAll(/\x1b\[38;5;\d+m/g, "")
            .replaceAll(/\x1b\[0m/g, "");
    }

    private createBorderLine(
        start: string,
        fill: string,
        separator: string,
        end: string,
        widths: number[]
    ): string {
        return start + widths.map(w => fill.repeat(w)).join(separator) + end;
    }

    private createTitleLine(title: string, widths: number[]): string {
        const totalWidth = widths.reduce((a, b) => a + b, (widths.length - 1) * 3);
        const halfWidth = totalWidth / 2 + title.length / 2;
        return "│ " + title.toUpperCase().padStart(halfWidth).padEnd(totalWidth) + " │";
    }

    private createFooterLine(footer: string, widths: number[]): string {
        const totalWidth = widths.reduce((a, b) => a + b, (widths.length - 1) * 3);
        return "│ " + footer.padEnd(totalWidth) + " │";
    }

    private createHeaderLine(columns: string[], widths: number[]): string {
        return "│ " + columns
            .map((col, i) => col.toUpperCase().padEnd(widths[i]))
            .join(" │ ") + " │";
    }

    private createBodyLines(
        rows: any[][],
        widths: number[],
        numberFormat: Intl.NumberFormat,
        limit: number
    ): string[] {
        return rows.slice(0, limit || undefined).map(row =>
            "│ " + row.map((value, i) => {
                let content = typeof value === 'number'
                    ? numberFormat.format(value)
                    : value.toString();
                let padding = content.includes("%%") ? widths[i] + 1 : widths[i];

                return (typeof value === 'number') ? content.padStart(padding) : content.padEnd(padding);
            }).join(" │ ") + " │"
        );
    }
}
