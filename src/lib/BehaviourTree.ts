interface Config {
    hooks?: {
        before?: (node: string, memory: any) => void;
        after?: (node: string, memory: any) => void;
        [Status.running]?: (node: string, memory: any) => void;
        [Status.success]?: (node: string, memory: any) => void;
        [Status.failure]?: (node: string, memory: any) => void;
    };
    plugins?: any;
}

export enum Status {
    running = "running",
    success = "success",
    failure = "failure"
}

export class BehaviourTree {
    private memory?: any;
    private config?: Config;

    constructor(memory?: any, config?: Config) {
        this.memory = memory;
        this.config = config;
    }

    async sequence(...nodes: ((memory: any) => Promise<Status>)[]): Promise<Status> {
        let status: Status = Status.failure;
        for (const key in nodes) {
            const node = nodes[key];
            const nodeName = "→." + (node.name === "" ? "anonymous" : node.name);
            this.config?.hooks?.before?.call(null, nodeName, this.memory);
            status = await node.call(null, this.memory);
            switch (status) {
                case Status.running:
                    this.config?.hooks?.running?.call(null, nodeName, this.memory);
                    break;
                case Status.success:
                    this.config?.hooks?.success?.call(null, nodeName, this.memory);
                    continue;
                case Status.failure:
                    this.config?.hooks?.failure?.call(null, nodeName, this.memory);
                    break;
                default:
                    throw new Error("Unknown status. Must be " + JSON.stringify(Status));
            }
            this.config?.hooks?.after?.call(null, nodeName, this.memory);
            break;
        }
        return status;
    }

    async select(...nodes: ((memory: any) => Promise<Status>)[]): Promise<Status> {
        let status: Status = Status.failure;
        for (const key in nodes) {
            const node = nodes[key];
            const nodeName = "?." + (node.name === "" ? "anonymous" : node.name);
            this.config?.hooks?.before?.call(null, nodeName, this.memory);
            status = await node.call(null, this.memory);
            switch (status) {
                case Status.running:
                    this.config?.hooks?.running?.call(null, nodeName, this.memory);
                    break;
                case Status.success:
                    this.config?.hooks?.success?.call(null, nodeName, this.memory);
                    break;
                case Status.failure:
                    this.config?.hooks?.failure?.call(null, nodeName, this.memory);
                    continue;
                default:
                    throw new Error("Unknown status. Must be " + JSON.stringify(Status));
            }
            this.config?.hooks?.after?.call(null, nodeName, this.memory);
            break;
        }
        return status;
    }
}
