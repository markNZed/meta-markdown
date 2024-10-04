// tests/tokenizer.test.ts

import { assertEquals, assertThrows } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { countTokens } from "@/utils/llm/tokenizer.ts";

Deno.test("countTokens - basic functionality", () => {
  // Test with simple strings
  // Replace the expected values with the actual token counts you get from `encode`.
  assertEquals(countTokens("Hello, world!"), 3);  // Hypothetical value
  assertEquals(countTokens("This is a test."), 4); // Hypothetical value
  assertEquals(countTokens("Deno is great for TypeScript."), 6); // Hypothetical value
});

Deno.test("countTokens - edge cases", () => {
  // Test with an empty string
  assertEquals(countTokens(""), 0); // No tokens
  
  // Test with a string of spaces
  assertEquals(countTokens("     "), 0); // No tokens
  
  // Test with special characters
  assertEquals(countTokens("!@#$%^&*()"), 10); // Hypothetical value
  
  // Test with a long string
  const longString = "This is a very long string that will be used to test the countTokens function to ensure it can handle longer inputs without any issues.";
  // Replace the expected value based on actual token count
  assertEquals(countTokens(longString), 28); // Hypothetical value
});

Deno.test("countTokens - error handling", () => {
  // Since countTokens expects a string, we can test that it throws an error for non-string inputs
  assertThrows(() => {
    // @ts-ignore - deliberately passing a non-string argument
    countTokens(123);
  }, TypeError, "Expected a string input");
  
  assertThrows(() => {
    // @ts-ignore - deliberately passing a non-string argument
    countTokens(null);
  }, TypeError, "Expected a string input");
  
  assertThrows(() => {
    // @ts-ignore - deliberately passing a non-string argument
    countTokens(undefined);
  }, TypeError, "Expected a string input");
});