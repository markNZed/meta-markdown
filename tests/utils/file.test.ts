// Import assertions from the standard library as per your import map
import {
  assertEquals,
  assertRejects,
} from "@std/assert";
import {
  resolvePath,
  getFilePaths,
  ensureDir,
} from "@/utils/file.ts";
import { join } from "@std/path";
import { config } from "@/config.ts";

// Helper function to mock Deno.mkdir
function mockDenoMkdir(mockImplementation: (path: string) => Promise<void>) {
  const originalMkdir = Deno.mkdir;
  Deno.mkdir = async (path: string | URL, _options?: Deno.MkdirOptions) => {
    const dirPath = typeof path === "string" ? path : path.pathname;
    return mockImplementation(dirPath);
  };
  return () => {
    Deno.mkdir = originalMkdir;
  };
}

// Test for resolvePath with absolute input
Deno.test("resolvePath - returns absolute path for absolute input", () => {
  const absolutePath = "/absolute/path/to/file.md";
  assertEquals(resolvePath(absolutePath), absolutePath);
});

// Test for resolvePath with relative input based on rootDir
Deno.test("resolvePath - resolves relative path based on rootDir", () => {
  const relativePath = "relative/path/to/file.md";
  config.rootDir = "/root/directory"; // Mock the rootDir
  assertEquals(
    resolvePath(relativePath),
    "/root/directory/relative/path/to/file.md",
  );
});

Deno.test("getFilePaths - resolves paths of files and directories with real filesystem", async () => {
  const tempDir = await Deno.makeTempDir();

  try {
    config.rootDir = tempDir;

    // Define the directory structure
    const dirPath = join(tempDir, "path", "to", "directory");
    const subDirPath = join(dirPath, "subdir");
    await ensureDir(dirPath);
    await ensureDir(subDirPath);

    // Create files
    const file1 = join(dirPath, "file1.md");
    const file2 = join(dirPath, "file2.markdown");
    const file3 = join(subDirPath, "file3.md");

    await Deno.writeTextFile(file1, "# File 1");
    await Deno.writeTextFile(file2, "# File 2");
    await Deno.writeTextFile(file3, "# File 3");

    // Call the function under test
    const filePaths = await getFilePaths(dirPath);

    // Sort both expected and actual arrays of file paths
    const expectedFilePaths = [file1, file2, file3].sort();
    const actualFilePaths = filePaths.sort();

    // Assert the results
    assertEquals(actualFilePaths, expectedFilePaths);
  } finally {
    // Clean up: Remove the temporary directory and its contents
    await Deno.remove(tempDir, { recursive: true });
  }
});

// Updated ensureDir rethrows unexpected errors test
Deno.test("ensureDir - rethrows unexpected errors", async () => {
  const dirPath = "error/directory/path";

  // Mock Deno.mkdir to throw an unexpected error
  const restoreMkdir = mockDenoMkdir(async (_path: string) => {
    throw new Error("Unexpected error");
  });

  try {
    await assertRejects(
      async () => {
        await ensureDir(dirPath);
      },
      Error,
      "Unexpected error",
    );
  } finally {
    // Restore the original Deno.mkdir
    restoreMkdir();
  }
});


// Test for ensureDir creating a directory if it doesn't exist
Deno.test("ensureDir - creates directory if it doesn't exist", async () => {
  const dirPath = "new/directory/path";

  // Mock Deno.mkdir to simulate successful directory creation
  const restoreMkdir = mockDenoMkdir(async (_path: string) => {
    // No action needed; simulate success
  });

  try {
    await ensureDir(dirPath);
    // If no error is thrown, the test passes
  } finally {
    // Restore the original Deno.mkdir
    restoreMkdir();
  }
});

// Test for ensureDir ignoring AlreadyExists error
Deno.test("ensureDir - ignores AlreadyExists error", async () => {
  const dirPath = "existing/directory/path";

  // Mock Deno.mkdir to throw AlreadyExists error
  const restoreMkdir = mockDenoMkdir(async (_path: string) => {
    throw new Deno.errors.AlreadyExists("Directory already exists");
  });

  try {
    await ensureDir(dirPath);
    // Should not throw an error
  } finally {
    // Restore the original Deno.mkdir
    restoreMkdir();
  }
});
