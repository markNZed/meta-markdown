/**
 * @module MessagePrompt
 * 
 * This module provides functions to display alerts, confirmations, and prompts to the user.
 * 
 * @function alertMessage
 * @description Displays an alert message to the user.
 * 
 * @function logAcknowledgedMessage
 * @description Logs a message to the console indicating that the alert has been acknowledged.
 * 
 * @function confirmProceed
 * @returns {boolean} Indicates whether the user wants to proceed after confirmation.
 * 
 * @function promptForName
 * @returns {string | null} The name entered by the user or null if canceled.
 * 
 * @function promptForAge
 * @returns {string | null} The age entered by the user or null if canceled.
 * 
 * @example
 * alertMessage("Please acknowledge the message.");
 * logAcknowledgedMessage();
 * const shouldProceed = confirmProceed();
 * const name = promptForName();
 * const age = promptForAge();
 * 
 * This module is intended for simple user interaction through dialog boxes.
 
 * @hash f015100c1258bb2c29cf20e79e8b32dfae031dc706e5cb952965a128336396f2
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


