/**
 * This module provides a simple user interaction functionality through alerts, prompts, and confirmations.
 * 
 * Usage:
 * - The `alert` function displays a message to the user and requires them to acknowledge it by pressing "OK".
 * - The `confirm` function prompts the user with a message and returns a boolean indicating whether the user pressed "OK" (true) or "Cancel" (false).
 * - The `prompt` function displays a dialog that prompts the user for input, returning the input value as a string, or null if the user cancels.
 * 
 * Example:
 * 
 * ```typescript
 * alert("Welcome to the application.");
 * const userConfirmed = confirm("Do you want to continue?");
 * if (userConfirmed) {
 *     const userName = prompt("What is your name?");
 *     console.log(`Hello, ${userName}!`);
 * }
 * ```
 */

alert("Please acknowledge the message.");
console.log("The message has been acknowledged.");
const shouldProceed = confirm("Do you want to proceed?");
console.log("Should proceed?", shouldProceed);
const name = prompt("Please enter your name:");
console.log("Name:", name);
const age = prompt("Please enter your age:", "18");
console.log("Age:", age);
alert("This is an alert"); // It displays a message and waits on enter


