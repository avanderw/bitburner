import { NS } from "@ns";

// Network scanning functionality
export class ContractScanner {
    private ns: NS;
    private scanned: Set<string>;

    constructor(ns: NS) {
        this.ns = ns;
        this.scanned = new Set<string>();
    }

    scanHost(hostname: string): Contract[] {
        const files = this.ns.ls(hostname, ".cct");
        const contracts: Contract[] = [];

        for (const file of files) {
            const type = this.ns.codingcontract.getContractType(file, hostname);
            contracts.push({
                server: hostname,
                filename: file,
                type,
                guesses: this.ns.codingcontract.getNumTriesRemaining(file, hostname),
            });
        }

        return contracts;
    }

    scanNetwork(startNode: string = "home"): Contract[] {
        this.ns.disableLog("scan");
        this.scanned.clear(); // Reset scanned hosts for fresh scan
        const toScan: string[] = [startNode];
        const contracts: Contract[] = [];

        while (toScan.length > 0) {
            const current = toScan.pop()!;
            if (this.scanned.has(current)) continue;

            this.scanned.add(current);
            const hosts = this.ns.scan(current);
            toScan.push(...hosts);

            const hostContracts = this.scanHost(current);
            contracts.push(...hostContracts);
        }

        this.ns.enableLog("scan");
        return contracts;
    }

    getScannedHosts(): string[] {
        return Array.from(this.scanned);
    }
}
