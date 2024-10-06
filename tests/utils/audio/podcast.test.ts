import { assertEquals, assert } from "@std/assert";
import { convertToPodcast } from "@/utils/audio/podcast.ts";
import type { Root } from "npm:@types/mdast";

Deno.test('convertToPodcast should convert AST to MP3 without mocking', async () => {
  // Define a sample Markdown AST
  const sampleAst: Root = {
    type: "root",
    children: [
      {
        type: "html",
        value: "<!-- Alice -->",
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "Hello, this is Alice speaking.",
          },
        ],
      },
      {
        type: "html",
        value: "<!-- Bob -->",
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "And this is Bob.",
          },
        ],
      },
    ],
  };

  // Config with speaker mapping
  const config = {
    speakers: [
      { Speaker: "Alice", TTS_Voice: "nova" },
      { Speaker: "Bob", TTS_Voice: "shimmer" },
    ],
  };

  // Call the function with a sample requestId and config
  const result = await convertToPodcast(sampleAst, {}, "test-request", config);

  // Validate the result; checking if it's a Uint8Array
  assert(result instanceof Uint8Array, "Result should be a Uint8Array");
});