// deno --version
//   deno 2.0.0-rc.7 (release candidate, release, x86_64-unknown-linux-gnu)
//   v8 12.9.202.13-rusty
//   typescript 5.6.2
// deno run src/scripts/demo.ts 
// deno task watch-scripts

alert("Please acknowledge the message.");
console.log("The message has been acknowledged.");
const shouldProceed = confirm("Do you want to proceed?");
console.log("Should proceed?", shouldProceed);
const name = prompt("Please enter your name:");
console.log("Name:", name);
const age = prompt("Please enter your age:", "18");
console.log("Age:", age);
alert("This is an alert"); // It displays a message and waits on enter


