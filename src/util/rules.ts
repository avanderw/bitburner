import { box } from "/util/format";
import { NS } from "../bitburner/NetscriptDefinitions";

export function ruleMaxMoney(ns: NS, target:string): Rule {
    const currMoney = ns.getServerMoneyAvailable(target);
    const maxMoney = ns.getServerMaxMoney(target);
    return {
        name: "Money",
        message: "Target money is maximized.",
        valid: currMoney === maxMoney
    };
}

export function ruleMinSecurity(ns: NS, target: string): Rule {
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const currSecurity = ns.getServerSecurityLevel(target);

    return {
        name: "Security",
        message: "Target security is minimised.",
        valid: currSecurity === minSecurity
    };
}

export function ruleNotOwned(ns:NS, target: string): Rule {
    return {
        name: "Ownership",
        message: "User does not own the target",
        valid: target !== "home"
    };
}

export function check(ns:NS, title:string, rules:Rule[]) {
    const content: string[] = [];
    const nameWidth = rules.map(rule => rule.name.length).reduce((a, b) => Math.max(a, b), 0);
    rules.forEach(rule =>
        content.push(ns.sprintf("%s %s: %s", rule.valid ? "+" : "-", rule.name.padStart(nameWidth), rule.message))
    );
    ns.print(box(title, content, { minWidth: 76 }));

    if (rules.every(rule => rule.valid)) {
        return;
    } else {
        ns.tail();
        ns.exit();
    }
}

export interface Rule {
    valid: boolean;
    name: string;
    message: string;
}

