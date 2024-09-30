export async function getDenoCacheDir(): Promise<string | null> {
    const command = new Deno.Command("deno", {
      args: ["info", "--json"],
    });
    const { stdout } = await command.output();
  
    const decoder = new TextDecoder();
    const jsonOutput = decoder.decode(stdout);
  
    try {
      const info = JSON.parse(jsonOutput);
      return info.denoDir;  // The path to Deno's cache directory
    } catch (error) {
      console.error("Error parsing Deno info output:", error);
      return null;
    }
}
  
export async function clearDenoGenCache() {
    const cacheDir = await getDenoCacheDir();
  
    if (!cacheDir) {
      console.error("Could not determine Deno cache directory.");
      return;
    }
  
    const genDir = `${cacheDir}gen/file`;  // Path to the `gen` folder
  
    try {
      await Deno.remove(genDir, { recursive: true });
      console.log(`Deno 'gen' cache cleared: ${genDir}`);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log("Deno 'gen' cache not found or already cleared. " + genDir);
      } else {
        console.error("Error clearing Deno 'gen' cache:", error);
      }
    }
}
