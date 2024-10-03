// watch-scripts.ts

// Import the Deno.Command class
const { Command } = Deno;

// Function to clear the terminal
async function clearTerminal() {
  const os = Deno.build.os;
  let cmd: string;
  let args: string[] = [];

  if (os === "windows") {
    cmd = "cmd";
    args = ["/c", "cls"];
  } else {
    cmd = "clear";
  }

  const clear = new Command(cmd, {
    args: args,
    stdout: "inherit",
    stderr: "inherit",
  });

  try {
    const status = await clear.output();
    if (!status.success) {
      console.error("Failed to clear the terminal.");
    }
  } catch (error) {
    console.error("Error while clearing terminal:", error);
  }
}

// Function to run a script with all permissions
async function runScript(scriptPath: string) {
  try {
    await clearTerminal();
    console.log(`\n[Rerunning] ${scriptPath}\n`);

    const run = new Command("deno", {
      args: ["run", "--allow-all", scriptPath],
      stdout: "inherit",
      stderr: "inherit",
    });

    const status = await run.output();

    if (status.success) {
      //console.log(`[Success] ${scriptPath} executed successfully.\n`);
    } else {
      console.error(`[Error] ${scriptPath} exited with status ${status.code}.\n`);
    }
  } catch (error) {
    console.error(`[Exception] Failed to run ${scriptPath}:`, error);
  }
}

// Debounce utility to prevent rapid reruns
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: number | undefined;
  return ((...args: any[]) => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Main watcher function with debounce and error handling
async function watchScripts() {
  console.log("Watching for changes in src/scripts/...\n");

  const scriptsDir = "src/scripts";

  // Create a debounced function to handle script changes
  const handleChange = debounce(async (scriptPath: string) => {
    await runScript(scriptPath);
  }, 300); // 300ms debounce interval

  for await (const event of Deno.watchFs(scriptsDir)) {
    for (const path of event.paths) {
      // Only handle TypeScript and JavaScript files on modify events
      if (
        (path.endsWith(".ts") || path.endsWith(".js")) &&
        event.kind === "modify"
      ) {
        handleChange(path);
      }
    }
  }
}

// Start watching scripts
watchScripts();
