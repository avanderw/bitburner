import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("sleep");

  // Configuration
  const CHECK_INTERVAL = 1000;  // Check every second
  const THREADS = 1;  // Default number of threads
  const WATCHER_PATH = ns.getScriptName();  // Path to this script
  const SPAWN_DELAY = 100;  // Delay before spawning in milliseconds

  // File hash tracking
  const fileHashes = new Map<string, string>();

  // Simple hash implementation
  function md5(input: string): string {
    let hash = 0;
    if (input.length === 0) return hash.toString(16);

    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return hash.toString(16);
  }

  // Function to get file content and hash it
  function getFileHash(filename: string): string {
    try {
      const content = ns.read(filename);
      return md5(content);
    } catch (error) {
      ns.tprint(`ERROR: Unable to read file ${filename}`);
      return "";
    }
  }

  // Initialize hashes for all JS files
  function initializeHashes(): void {
    const files = ns.ls("home", ".js");
    for (const file of files) {
      const hash = getFileHash(file);
      if (hash !== "") {
        fileHashes.set(file, hash);
      }
    }
    ns.tprint(`Initialized watching ${files.length} JavaScript files`);
  }

  // Restart a script with its current arguments
  async function restartScript(script: string): Promise<void> {
    try {
      // Special handling for the watcher script
      if (script === WATCHER_PATH) {
        ns.print(`Watcher script changed - respawning...`);
        ns.spawn(script, { spawnDelay: SPAWN_DELAY }, ...ns.args);
        return;
      }

      // Get current running instances of the script
      const processes = ns.ps().filter(process => process.filename === script);

      if (processes.length > 0) {
        // Kill all running instances
        ns.kill(script);
        ns.print(`Killed all instances of ${script}`);

        // Restart each instance with its original arguments and threads
        for (const process of processes) {
          await ns.run(script, process.threads, ...process.args);
          ns.print(`Restarted ${script} with ${process.threads} threads and args: ${process.args.join(", ")}`);
        }
      } else if (ns.read(script).indexOf("main(ns)") !== -1) {
        // If script wasn't running, start with default settings
        await ns.run(script, THREADS);
        ns.print(`Started ${script} with ${THREADS} threads`);
      } else {
        ns.print(`Skipping ${script} - not a script with main(ns) function`);
      }
    } catch (error) {
      ns.tprint(`ERROR: Failed to restart ${script}`);
    }
  }

  // Initialize file tracking
  initializeHashes();

  // Main loop
  while (true) {
    await ns.sleep(CHECK_INTERVAL);

    const files = ns.ls("home", ".js");

    // Check each JS file for changes
    for (const file of files) {
      const currentHash = getFileHash(file);
      if (currentHash === "") continue;

      // Handle new files
      if (!fileHashes.has(file)) {
        ns.print(`New file detected: ${file}`);
        fileHashes.set(file, currentHash);
        await restartScript(file);
        continue;
      }

      // Check for changes in existing files
      if (currentHash !== fileHashes.get(file)) {
        ns.print(`File ${file} has changed!`);
        await restartScript(file);
        fileHashes.set(file, currentHash);
      }
    }

    // Check for deleted files
    for (const [file] of fileHashes) {
      if (!files.includes(file)) {
        ns.print(`File ${file} has been deleted`);
        fileHashes.delete(file);
      }
    }
  }
}