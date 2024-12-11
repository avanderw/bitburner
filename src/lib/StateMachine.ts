interface State<T> {
    from: string | string[];
    guard?: ((memory: T) => boolean)[];
    enter?: ((memory: T) => void)[];
    exit?: ((memory: T) => void)[];
    before?: ((memory: T) => void)[];
    action?: (memory: T) => Promise<string>;
    after?: ((memory: T) => void)[];
    transition?: { [id: string]: string };
}

interface StateEngine<T> {
    states: { [id: string]: State<T> };
    initial: string;
    hooks?: {
        before?: (from: string, to: string) => void;
        after?: (from: string, to: string) => void;
        denied?: (from: string, to: string) => void;
        success?: (from: string, to: string) => void;
    };
    plugins?: { history?: () => void };
}

export class StateMachine<T> {
    private engine: StateEngine<T>;
    private current: string;
    private memory: T;

    constructor(engine: StateEngine<T>, memory: T) {
        this.engine = engine;
        this.memory = memory;
        this.current = engine.initial;
        engine.states[engine.initial].enter?.forEach(func => func.call(null, memory));
    }

    is(id: string): boolean {
        return this.current === id;
    }

    to(id: string): void {
        const from = this.current;
        const fromState = this.engine.states[from];
        const to = fromState.transition?.[id] || id;
        const toState = this.engine.states[to];

        this.engine.hooks?.before?.call(null, from, to);
        if (
            toState !== undefined &&
            (toState.from.includes(from) || toState.from.includes("*")) &&
            (toState.guard === undefined ||
                toState.guard!.map(func => func.call(null, this.memory)).reduce((a, b) => a && b, true))
        ) {
            this.engine.hooks?.success?.call(null, from, to);
            fromState.exit?.forEach(func => func.call(null, this.memory));
            toState.enter?.forEach(func => func.call(null, this.memory));
            this.current = to;
        } else {
            this.engine.hooks?.denied?.call(null, from, to);
        }

        this.engine.hooks?.after?.call(null, from, to);
    }

    async do(): Promise<void> {
        const state = this.engine.states[this.current];

        state.before?.forEach(func => func.call(null, this.memory));
        const transitionId = await state.action?.call(null, this.memory);
        state.after?.forEach(func => func.call(null, this.memory));

        this.to(transitionId!);
    }
}
