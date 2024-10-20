#!/bin/bash

# There is no easyt way to pass in the options  --allow-read --allow-write via #! so we need to call the deno script form a bash script...
deno run --allow-read --allow-write concatenate_project.ts
