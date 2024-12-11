interface Span {
    id:string,
    traceId:string,
    parentId?:string,
    name:string,
    timestamp:number,
    duration:number,
    localEndpoint:{serviceName:string, ipv4:string},
    annotations?:[{timestamp:number,value:string}?],
    tags?:{[name:string]:string}
}