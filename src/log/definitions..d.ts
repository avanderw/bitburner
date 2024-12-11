interface Logs {
    streams:Stream[]
}

interface Stream {
    stream:{[key:string]:string}
    values:Entry[][]
}
