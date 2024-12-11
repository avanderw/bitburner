import { NS } from "/lib/NetscriptDefinitions";

export async function main(ns: NS) {
    ns.tail();
    ns.disableLog("ALL");

    while (true) {
        ns.clearLog();

        const interval = 1000;
        ns.print(performance.now());
        ns.print(Wheel(interval, AsciiWheel));
        ns.print(Wheel(interval, BounceWheel));
        ns.print(Wheel(interval, BrailleWheel));
        ns.print(Wheel(interval, ClockWheel));
        ns.print(Wheel(interval, Dots));
        ns.print(Wheel(interval, EarthWheel));
        ns.print(Wheel(interval, FiraWheel));
        ns.print(Wheel(interval, MonoDots));
        ns.print(Wheel(interval, MoonWheel));
        ns.print(Wheel(interval, ScrollingDots));
        ns.print(Wheel(interval, ["=>   ", "==>  ", "===> ", "====>"]));
        ns.print(Wheel(interval, ["V", "<", "^", ">"]));
        ns.print(Wheel(interval, [".", "o", "0", "o"]));

        await ns.sleep(250);
    }

}

export const AsciiWheel    = ['|', '/', '-', '\\'];
export const BounceWheel   = ["⠁", "⠂", "⠄", "⡀", "⠄", "⠂"];
export const BrailleWheel  = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
export const ClockWheel    = ["🕛 ", "🕐 ", "🕑 ", "🕒 ", "🕓 ", "🕔 ", "🕕 ", "🕖 ", "🕗 ", "🕘 ", "🕙 ", "🕚 "];
export const Dots          = ['.', '..', '...'];
export const EarthWheel    = ["🌍 ", "🌎 ", "🌏 "];
export const FiraWheel     = ['', '', '', '', '', ''];
export const MonoDots      = ['․', '‥', '…'];
export const MoonWheel     = ["🌑 ", "🌒 ", "🌓 ", "🌔 ", "🌕 ", "🌖 ", "🌗 ", "🌘 "];
export const ScrollingDots = [".  ", ".. ", "...", " ..", "  .", "   "];

export function Wheel(interval = 1000, frames = AsciiWheel) {
    return frames[Math.floor(performance.now() / interval) % frames.length];
}