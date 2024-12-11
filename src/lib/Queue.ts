export interface Queue<T> {
    enqueue(payload: T): void;
    dequeue(): T;
    contains(payload: T): boolean;
    peek(): T;
    size(): number;
    isEmpty(): boolean;
    hasItems(): boolean;
}
