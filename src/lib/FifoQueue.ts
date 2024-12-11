import { Queue } from "./Queue";

export class FifoQueue<T> implements Queue<T> {
    private queue: T[] = [];

    enqueue(payload: T): void {
        this.queue.push(payload);
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
}
