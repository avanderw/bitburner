import { NS } from "@ns";

const crimes = [
    "Shoplift",
    "Rob Store",
    "Mug", "Larceny",
    "Deal Drugs",
    "Bond Forgery",
    "Traffick Arms",
    "Homicide",
    "Grand Theft Auto",
    "Kidnap",
    "Assassination",
    "Heist",
]

export async function main(ns: NS): Promise<void> {
    const mostMoney = crimes.reduce((a, b) => {
        // @ts-ignore
        const moneyA = ns.singularity.getCrimeStats(a).money * ns.singularity.getCrimeChance(a) / ns.singularity.getCrimeStats(a).time;
        // @ts-ignore
        const moneyB = ns.singularity.getCrimeStats(b).money * ns.singularity.getCrimeChance(b) / ns.singularity.getCrimeStats(b).time;
        return moneyA > moneyB ? a : b
    }, crimes[0]);

    const mostKarma = crimes.reduce((a, b) => {
        // @ts-ignore
        const karmaA = ns.singularity.getCrimeStats(a).karma * ns.singularity.getCrimeChance(a) / ns.singularity.getCrimeStats(a).time;
        // @ts-ignore
        const karmaB = ns.singularity.getCrimeStats(b).karma * ns.singularity.getCrimeChance(b) / ns.singularity.getCrimeStats(b).time;
        return karmaA > karmaB ? a : b
    }, crimes[0]);

    const mostHackingXP = crimes.reduce((a, b) => {
        // @ts-ignore
        const hackingXPA = ns.singularity.getCrimeStats(a).hacking_exp * ns.singularity.getCrimeChance(a) / ns.singularity.getCrimeStats(a).time;
        // @ts-ignore
        const hackingXPB = ns.singularity.getCrimeStats(b).hacking_exp * ns.singularity.getCrimeChance(b) / ns.singularity.getCrimeStats(b).time;
        return hackingXPA > hackingXPB ? a : b
    }, crimes[0]);
    const mostStrengthXP = crimes.reduce((a, b) => {
        // @ts-ignore
        const strengthXPA = ns.singularity.getCrimeStats(a).strength_exp * ns.singularity.getCrimeChance(a) / ns.singularity.getCrimeStats(a).time;
        // @ts-ignore
        const strengthXPB = ns.singularity.getCrimeStats(b).strength_exp * ns.singularity.getCrimeChance(b) / ns.singularity.getCrimeStats(b).time;
        return strengthXPA > strengthXPB ? a : b
    }, crimes[0]);
    const mostDefenseXP = crimes.reduce((a, b) => {
        // @ts-ignore
        const defenseXPA = ns.singularity.getCrimeStats(a).defense_exp * ns.singularity.getCrimeChance(a) / ns.singularity.getCrimeStats(a).time;
        // @ts-ignore
        const defenseXPB = ns.singularity.getCrimeStats(b).defense_exp * ns.singularity.getCrimeChance(b) / ns.singularity.getCrimeStats(b).time;
        return defenseXPA > defenseXPB ? a : b
    }, crimes[0]);
    const mostDexterityXP = crimes.reduce((a, b) => {
        // @ts-ignore
        const dexterityXPA = ns.singularity.getCrimeStats(a).dexterity_exp * ns.singularity.getCrimeChance(a) / ns.singularity.getCrimeStats(a).time;
        // @ts-ignore
        const dexterityXPB = ns.singularity.getCrimeStats(b).dexterity_exp * ns.singularity.getCrimeChance(b) / ns.singularity.getCrimeStats(b).time;
        return dexterityXPA > dexterityXPB ? a : b
    }
    , crimes[0]);
    const mostAgilityXP = crimes.reduce((a, b) => {
        // @ts-ignore
        const agilityXPA = ns.singularity.getCrimeStats(a).agility_exp * ns.singularity.getCrimeChance(a) / ns.singularity.getCrimeStats(a).time;
        // @ts-ignore
        const agilityXPB = ns.singularity.getCrimeStats(b).agility_exp * ns.singularity.getCrimeChance(b) / ns.singularity.getCrimeStats(b).time;
        return agilityXPA > agilityXPB ? a : b
    }, crimes[0]);
    const mostCharismaXP = crimes.reduce((a, b) => {
        // @ts-ignore
        const charismaXPA = ns.singularity.getCrimeStats(a).charisma_exp * ns.singularity.getCrimeChance(a) / ns.singularity.getCrimeStats(a).time;
        // @ts-ignore
        const charismaXPB = ns.singularity.getCrimeStats(b).charisma_exp * ns.singularity.getCrimeChance(b) / ns.singularity.getCrimeStats(b).time;
        return charismaXPA > charismaXPB ? a : b
    }, crimes[0]);
    const mostIntelligenceXP = crimes.reduce((a, b) => {
        // @ts-ignore
        const intelligenceXPA = ns.singularity.getCrimeStats(a).intelligence_exp * ns.singularity.getCrimeChance(a) / ns.singularity.getCrimeStats(a).time;
        // @ts-ignore
        const intelligenceXPB = ns.singularity.getCrimeStats(b).intelligence_exp * ns.singularity.getCrimeChance(b) / ns.singularity.getCrimeStats(b).time;
        return intelligenceXPA > intelligenceXPB ? a : b
    }, crimes[0]);

    ns.tprint(`Most profitable crime: ${mostMoney}`);
    ns.tprint(`Most karma crime: ${mostKarma}`);
    ns.tprint(`Most hacking XP crime: ${mostHackingXP}`);
    ns.tprint(`Most strength XP crime: ${mostStrengthXP}`);
    ns.tprint(`Most defense XP crime: ${mostDefenseXP}`);
    ns.tprint(`Most dexterity XP crime: ${mostDexterityXP}`);
    ns.tprint(`Most agility XP crime: ${mostAgilityXP}`);
    ns.tprint(`Most charisma XP crime: ${mostCharismaXP}`);
    ns.tprint(`Most intelligence XP crime: ${mostIntelligenceXP}`);
    
    // @ts-ignore
    ns.singularity.commitCrime(mostMoney);
}