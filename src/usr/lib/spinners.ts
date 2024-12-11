export function Spinner(interval = 130, frames = ['-', '\\', '|', '/']) {
    return frames[Math.floor(performance.now() / interval) % frames.length];
}