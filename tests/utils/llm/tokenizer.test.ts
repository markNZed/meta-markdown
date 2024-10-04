// tests/tokenizer.test.ts

import { assertEquals, assertThrows } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { countTokens } from "@/utils/llm/tokenizer.ts";

Deno.test("countTokens - basic functionality", () => {
  // Test with simple strings
  assertEquals(countTokens("Hello, world!"), 4);  // "Hello", ",", "world", "!"
  assertEquals(countTokens("This is a test."), 5); // "This", "is", "a", "test", "."
  assertEquals(countTokens("Deno is great for TypeScript."), 8); // "Deno", "is", "great", "for", "TypeScript", "."
});

Deno.test("countTokens - edge cases", () => {
  // Test with an empty string
  assertEquals(countTokens(""), 0); // No tokens
  
  // Test with a string of spaces
  assertEquals(countTokens("     "), 0); // No tokens
  
  // Test with special characters
  assertEquals(countTokens("!@#$%^&*()"), 10); // Each character is a token
  
  // Test with a long string
  const longString = "This is a very long string that will be used to test the countTokens function to ensure it can handle longer inputs without any issues.";
  // The expected token count may vary, so this is an illustrative example.
  assertEquals(countTokens(longString), 27); // Adjust based on actual token count
});

Deno.test("countTokens - error handling", () => {
  // Since countTokens expects a string, we can test that it throws an error for non-string inputs
  assertThrows(() => {
    // @ts-ignore - deliberately passing a non-string argument
    countTokens(123);
  }, TypeError, "text must be a string");
  
  assertThrows(() => {
    // @ts-ignore - deliberately passing a non-string argument
    countTokens(null);
  }, TypeError, "text must be a string");
  
  assertThrows(() => {
    // @ts-ignore - deliberately passing a non-string argument
    countTokens(undefined);
  }, TypeError, "text must be a string");
});

// You can add more tests here as needed...