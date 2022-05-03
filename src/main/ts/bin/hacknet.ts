/**
 * Version 1: Initial release
 *
 * 0. Buy/upgrade hacknet nodes.
 * 1. Reserve money for future purchases.
 * 2. Stop when reaching the breakeven point.
 * 3. Estimate how long it will take to reach the next purchase.
 * 4. Default the reserve to the cost of a server with home RAM.
 * 5. Exit if home RAM is too low.
 */
export const version = "1.5-alpha";

import { NS } from "/bitburner/NetscriptDefinitions";

export async function main(ns: NS) {
  ns.disableLog("ALL");

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
  const integer = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  });

  const flags = ns.flags([
    ["reserve", 0],
    ["breakeven", 60 * 60 * 1],
    ["ram", ns.getScriptRam("/bin/hacknet.js") * 100],
  ]);

  while (true) {
    ns.clearLog();
    const homeRam = ns.getServerMaxRam("home");
    const purchaseServerCost = ns.getPurchasedServerCost(homeRam);

    // Reserve money to the cost of a server with home RAM.
    let reserve = flags.reserve;
    if (reserve === 0 && purchaseServerCost < ns.hacknet.getPurchaseNodeCost()) {
      reserve = purchaseServerCost;
    }

    // Purchase hacknet
    let allowedBudget = ns.getServerMoneyAvailable("home") - reserve;
    let nextPurchase = allActions(ns).sort((a, b) => a.cost - b.cost)[0];
    let totalSpent = 0;
    while (nextPurchase.cost < allowedBudget) {
      nextPurchase.func.call(null, ...nextPurchase.args);
      totalSpent += nextPurchase.cost;
      allowedBudget -= nextPurchase.cost;
      nextPurchase = allActions(ns).sort((a, b) => a.cost - b.cost)[0];
    }

    // Notify client
    if (totalSpent > 0) {
      ns.toast(`Spent ${money.format(totalSpent)} on the Hacknet`);
    }

    // Log statistics
    const pps = prodPerSecond(ns);
    const hacknetWait = Math.ceil(nextPurchase.cost / pps);
    const serverWait = Math.ceil(purchaseServerCost / pps);
    ns.print(
      box(
        "Hacknet",
        form([
          { label: "Prod/s", value: money.format(pps) },
          { label: "Money", value: money.format(ns.getServerMoneyAvailable("home")) },
          { label: "Hacknet node", value: `${money.format(ns.hacknet.getPurchaseNodeCost())}` },
          { label: `${integer.format(homeRam)}GB server`, value: money.format(purchaseServerCost) },
          {
            label: "Server progress",
            value: `${progress(ns.hacknet.getPurchaseNodeCost(), purchaseServerCost)}`
          },
          {
            label: "Reserve" + (flags.reserve > 0 ? " (override)" : ""),
            value: money.format(reserve)
          },
          { label: "Budget", value: money.format(allowedBudget) },
          { label: "Hacknet cost", value: money.format(nextPurchase.cost) },
          { label: "Hacknet progess", value: `${progress(allowedBudget, nextPurchase.cost)}` },
          {
            label: "Remaining wait",
            value: `${integer.format(Math.ceil((nextPurchase.cost - allowedBudget) / pps))}s`
          },
          { label: "Hacknet wait", value: `${integer.format(hacknetWait)}s` },
          { label: "Server wait", value: `${integer.format(serverWait)}s` },
          { label: "Breakeven", value: `${integer.format(flags.breakeven)}s` }
        ]).split("\n")
      )
    );

    // Break if we have to wait longer than the breakeven point.
    if (hacknetWait > flags.breakeven) {
      break;
    }

    // Break if the RAM on the host is low.
    if (homeRam < flags.ram) {
        ns.toast(`Not enough RAM (${integer.format(flags.ram)}GB)`);
        break;
    }

    await ns.sleep(1000);
  }
}

function prodPerSecond(ns: NS): number {
  let pps = 0;
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    pps += ns.hacknet.getNodeStats(i).production;
  }
  return pps === 0 ? Number.MAX_SAFE_INTEGER : pps; // handle hacknet with no nodes
}

function allActions(ns: NS): [{ cost: number; func: Function; args: any[] }] {
  const actions: [{ cost: number; func: Function; args: any[] }] = [
    { cost: ns.hacknet.getPurchaseNodeCost(), func: ns.hacknet.purchaseNode, args: [] }
  ];
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    actions.push({ cost: ns.hacknet.getLevelUpgradeCost(i, 1), func: ns.hacknet.upgradeLevel, args: [i, 1] });
    actions.push({ cost: ns.hacknet.getRamUpgradeCost(i, 1), func: ns.hacknet.upgradeRam, args: [i, 1] });
    actions.push({ cost: ns.hacknet.getCoreUpgradeCost(i, 1), func: ns.hacknet.upgradeCore, args: [i, 1] });
  }
  actions.sort((a, b) => a.cost - b.cost);
  return actions;
}

function form(lines: { label: string; value: string }[]): string {
  const maxLabel = lines.map(line => line.label.length).reduce((a, b) => Math.max(a, b), 0);
  const maxValue = lines.map(line => line.value.length).reduce((a, b) => Math.max(a, b), 0);
  let out = "";
  lines.forEach(line => (out += `${line.label.padStart(maxLabel)}: ${line.value.padStart(maxValue)}\n`));
  out = out.slice(0, out.length - 1);
  return out;
}

function progress(value: number, max: number): string {
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

function box(title: string, lines: string[], opts?: { pattern?: string; minWidth?: number }): string {
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
  out += pattern.charAt(6) + "".padStart(width + 2, pattern.charAt(3)) + pattern.charAt(7);

  return out;
}
