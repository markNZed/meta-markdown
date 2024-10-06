// tests/utils/audio/audioUtils.test.ts

import { assert } from "@std/assert";
import { mergeAudioFiles } from "@/utils/audio/audioUtils.ts";
import { join } from "https://deno.land/std@0.203.0/path/mod.ts";

// Define the test case
Deno.test("mergeAudioFiles successfully merges input audio files", async () => {
  // Create a temporary directory for the test
  const tmpDir = await Deno.makeTempDir();

  try {
    // Define paths for input audio files
    const inputFile1 = join(tmpDir, "file1.mp3");
    const inputFile2 = join(tmpDir, "file2.mp3");

    // Generate silent audio files using FFmpeg
    await new Deno.Command("ffmpeg", {
      args: [
        "-f",
        "lavfi",
        "-i",
        "anullsrc=channel_layout=mono:sample_rate=44100",
        "-t",
        "1",
        "-q:a",
        "9",
        "-acodec",
        "libmp3lame",
        inputFile1,
      ],
      stdout: "null",
      stderr: "null",
    }).output();

    await new Deno.Command("ffmpeg", {
      args: [
        "-f",
        "lavfi",
        "-i",
        "anullsrc=channel_layout=mono:sample_rate=44100",
        "-t",
        "1",
        "-q:a",
        "9",
        "-acodec",
        "libmp3lame",
        inputFile2,
      ],
      stdout: "null",
      stderr: "null",
    }).output();

    // Define the output file path
    const outputFile = join(tmpDir, "merged.mp3");

    // Define a requestId for logging purposes
    const requestId = "test_request";

    // Call the mergeAudioFiles function with the test parameters
    await mergeAudioFiles({
      inputFiles: [inputFile1, inputFile2],
      outputFile,
      requestId,
      cacheDir: tmpDir,
    });

    // Check that the output file exists
    const outputFileInfo = await Deno.stat(outputFile);
    assert(outputFileInfo.isFile, "Output file should exist and be a file.");

    // Optionally, verify that the output file has a non-zero size
    assert(
      outputFileInfo.size > 0,
      "Output file should have a non-zero size."
    );
  } finally {
    // Clean up: Remove the temporary directory and its contents
    await Deno.remove(tmpDir, { recursive: true });
  }
});