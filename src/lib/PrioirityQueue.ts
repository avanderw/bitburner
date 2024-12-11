import { Queue } from "./Queue";

/** Simple queue that sorts after each mutable call. Do not use for large data sources. Rewrite to use a heap. */
export class PriorityQueue<T> implements Queue<T> {
    private queue: T[] = [];
    private sort: (a: T, b: T) => number;
    private reverse:boolean;

    constructor(sort: (a: T, b: T) => number, reverse:boolean = false) {
        this.sort = sort;
        this.reverse= reverse;
    }

    enqueue(payload: T): void {
        this.queue.push(payload);
        this.queue.sort(this.sort);
        if (this.reverse) {
            this.queue.reverse();
        }
    }

    dequeue(): T {
        return this.queue.shift()!;
    }

    contains(payload: T): boolean {
        return this.queue.indexOf(payload) !== -1;
    }

    peek(): T {
        return this.queue[0];
    }

    hasItems() {
        return !this.isEmpty();
    }

    size(): number {
        return this.queue.length;
    }

    isEmpty(): boolean {
        return this.queue.length === 0;
    }

    toString() {
        return this.queue.toString();
    }
}
