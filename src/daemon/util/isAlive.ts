export function isAlive(args:{runs:number, once:boolean, o:boolean}):boolean {
    if (args.runs > 0) {
        if (args.once || args.o) {
            args.runs = 0;
            return true;
        }
        args.runs--;
        return true;
    }

    return false;
}