// tests/markdown_test.ts

import { assertEquals, assertThrows } from "@std/assert";

import {
    parseMarkdown,
    stringifyMarkdown,
    createHeading,
    insertHeading,
} from "../src/utils/markdown/markdown.ts";

Deno.test("parseMarkdown and stringifyMarkdown should be inverse operations", () => {
    const markdown = "# Heading\n\nThis is a paragraph.";
    const ast = parseMarkdown(markdown);
    const resultMarkdown = stringifyMarkdown(ast).trim();
    assertEquals(resultMarkdown, markdown);
});

Deno.test("createHeading should create a valid heading node", () => {
    const heading = createHeading(2, "Test Heading");
    console.log("heading", heading)
    assertEquals(heading.type, "heading");
    assertEquals(heading.depth, 2);
    // Asserting the first child is defined and has the correct type
    const firstChild = heading.children?.[0] as { type: string; value: string };
    assertEquals(firstChild.type, "text");
    assertEquals(firstChild.value, "Test Heading");
});

Deno.test("insertHeading should insert heading at correct position", () => {
    const markdown = "# Original Heading\n\nContent here.";
    const ast = parseMarkdown(markdown);
    const newHeading = createHeading(2, "Inserted Heading");
    insertHeading(ast, newHeading, 1);
    const resultMarkdown = stringifyMarkdown(ast);
    const expectedMarkdown = "# Original Heading\n\n## Inserted Heading\n\nContent here.";
    assertEquals(resultMarkdown.trim(), expectedMarkdown);
});

Deno.test("createHeading should throw error for invalid depth", () => {
    assertThrows(
        () => createHeading(7 as 1 | 2 | 3 | 4 | 5 | 6, "Invalid Heading"),
        Error,
        "Invalid heading depth. Must be an integer between 1 and 6.",
    );
});
