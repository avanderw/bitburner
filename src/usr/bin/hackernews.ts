import {NS} from "/lib/NetscriptDefinitions";

export const release = {
    "version": "1.0-final",
    "description": "List the latest stories on hackernews.",
    "log": ["1.0 List stories on hackernews"]
}

export async function main(ns: NS) {
    let out = "\u001b[36m";
    const HACKER_NEWS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.ycombinator.com%2Frss';
    await fetch(HACKER_NEWS_URL).then(response => response.json()).then(data => {
        for (const item of data.items) {
            out += `${item.title}\n`;
        }
    });
    out += "\u001b[0m";
    ns.print(out);
    ns.tail();
} 