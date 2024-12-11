interface Faction {
    name: string;
    requirement: string[];
}

export function all(): Faction[] {
    return [
        { name: "NiteSec", requirement: ["Hack //avmnite-02h/ manually", "Home RAM at least 32GB"] },
        { name: "The Black Hand", requirement: ["//Hack I.I.I.I/ manually", "Home RAM at least 64GB"] },
        { name: "BitRunners", requirement: ["Hack //run4theh111z/ manually", "Home RAM at least 128GB"] },
        { name: "MegaCorp", requirement: ["Work for MegaCorp", "At least 200,000 reputation"] },
        { name: "Blade Industries", requirement: ["Work for Blade Industries", "At least 200,000 reputation"] },
        { name: "Four Sigma", requirement: ["Work for Four Sigma", "At least 200,000 reputation"] },
        { name: "NWO", requirement: ["Work for NWO", "At least 200,000 reputation"] },
        { name: "OmniTek Incorporated", requirement: ["Work for OmniTek Incorporated", "At least 200,000 reputation"] },
        { name: "ECorp", requirement: ["Work for ECorp", "At least 200,000 reputation"] },
        { name: "Bachman & Associates", requirement: ["Work for Bachman & Associates", "At least 200,000 reputation"] },
        { name: "Clarke Incorporated", requirement: ["Work for Clarke Incorporated", "At least 200,000 reputation"] },
        {
            name: "Fulcrum Secret Technologies",
            requirement: [
                "Work for Fulcrum Secret Technologies",
                "At least 200,000 reputation",
                "Hack //fulcrumassets/ manually"
            ]
        }
    ];
}
