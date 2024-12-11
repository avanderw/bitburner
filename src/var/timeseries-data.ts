export const data:number[] = randomData(128);

function randomData(length: number): number[] {
    const d: number[] = [];
    for (let i = 0; i < length; i++) {
        d.push(Math.ceil(Math.random() * 10));
    }
    return d;
}