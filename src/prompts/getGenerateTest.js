export const getGenerateTest = (content) => {
    return `**Project Overview:**

The project is an **AI-Powered Markdown Manipulation Tool** developed using **Deno**. It facilitates the editing, summarizing, and converting of Markdown files by leveraging the **OpenAI API**. The tool supports both script-based and notebook-based workflows, utilizing Deno for JavaScript/TypeScript execution and the Deno kernel with Jupyter for interactive notebooks.

**Key Features:**
- **Markdown Editing:** Insert headings, paragraphs, and manipulate Markdown AST (Abstract Syntax Tree).
- **AI Integration:** Summarize content, improve style, perform grammar checks, and generate glossaries using OpenAI.
- **File Management:** Read from and write to Markdown files, ensure directory structures, and handle path resolutions.
- **Logging:** Robust logging utility that logs to both console and file with detailed source information.
- **Audio Processing:** Convert Markdown content to podcast-ready MP3 files using Text-to-Speech (TTS) and audio merging utilities.
- **Testing:** Automated test generation and execution for TypeScript files.
- **Web Server:** Serve static files and handle WebSocket connections for live-reloading.

---

**Directory Structure:**
.
├── deno.json
├── import_map.json
├── README.md
├── src
│   ├── scripts
│   │   ├── blocks
│   │   │   └── listTsFiles.ts
│   │   ├── demo.ts
│   │   ├── demoUI.ts
│   │   ├── generateAndRunTests.ts
│   │   ├── generateDocumentation.ts
│   │   ├── grammarCheck.js
│   │   ├── summarize.js
│   │   └── rewriteForAudience.ts
│   ├── server.ts
│   ├── types
│   │   └── markdown.ts
│   └── utils
│       ├── audio
│       │   ├── audioUtils.ts
│       │   ├── podcast.ts
│       │   └── tts.ts
│       ├── llm
│       │   ├── tokenizer.ts
│       │   └── llm.ts
│       ├── logger.ts
│       ├── markdown
│       │   ├── astUtils.ts
│       │   ├── editorial.ts
│       │   ├── fileIO.ts
│       │   ├── glossary.ts
│       │   ├── markdown.ts
│       │   └── rewriter.ts
│       ├── misc.ts
│       └── file.ts
├── tests
│   └── utils
│       ├── audio
│       │   └── tts.test.ts
│       ├── llm
│       │   └── tokenizer.test.ts
│       ├── markdown
│       │   └── fileIO.test.ts
│       └── file.test.ts
---

**Overview of Key Utilities:**

1. **Markdown Utilities (src/utils/markdown/):**
   - **markdown.ts:** Functions for parsing and stringifying Markdown content, creating and inserting headings, summarizing content using AI, improving style, and checking grammar.
   - **fileIO.ts:** Functions to read from and write to Markdown files, format Markdown using remark, and handle file paths.
   - **editorial.ts:** Functions that interface with the OpenAI API to perform developmental edits, line edits, copy edits, proofreading, technical edits, and fact-checking.
   - **astUtils.ts:** Utilities for manipulating the Markdown AST, such as finding nodes by type and replacing nodes.
   - **rewriter.ts:** Function to rewrite Markdown content tailored for a specific audience.
   - **glossary.ts:** Function to generate a glossary from Markdown content using AI.

2. **File Utilities (src/utils/file.ts):**
   - **resolvePath:** Resolves relative and absolute file paths based on the project's root directory.
   - **getFilePaths:** Retrieves file paths based on input patterns, handling directories and glob patterns.
   - **ensureDir:** Ensures that a specified directory exists, creating it if necessary.

3. **Logging Utility (src/utils/logger.ts):**
   - Provides robust logging capabilities with different log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL).
   - Logs are output to both the console and a dynamically named log file.
   - Each log entry includes a timestamp and source information (function name, file path, line, and column).

4. **LLM Utilities (src/utils/llm/):**
   - **llm.ts:** Interfaces with the OpenAI API, handling token counting, caching responses, and making API calls.
   - **tokenizer.ts:** Utility to count tokens in a given text using GPT-3 encoding.

5. **Audio Utilities (src/utils/audio/):**
   - **tts.ts:** Converts text to speech using OpenAI's TTS API, handling caching and splitting of text into manageable chunks.
   - **audioUtils.ts:** Merges multiple audio files into a single MP3 using FFmpeg.
   - **podcast.ts:** Converts Markdown AST into podcast-ready MP3 files, handling speaker mappings and audio merging.

6. **Scripts (src/scripts/):**
   - **demo.ts:** Demonstrates Markdown manipulation by reading, parsing, modifying, and writing Markdown files with AI enhancements.
   - **generateAndRunTests.ts:** Automatically generates and runs tests for TypeScript files using OpenAI to create test cases.
   - **generateDocumentation.ts:** Generates JSDoc comments for TypeScript files using OpenAI.
   - **watch-scripts.ts:** Watches for changes in the src/scripts directory and reruns scripts as needed.
   - **Additional scripts** for summarizing Markdown, grammar checking, and rewriting content for specific audiences.

7. **Server (src/server.ts):**
   - Serves static files from the public directory.
   - Handles WebSocket connections for live-reloading of frontend assets like app.html and app.js.

---

**Instructions for Generating Tests:**

Given the above project context, directory structure, and utility overviews, please generate sanity tests, checking the main behavior, for the specified TypeScript file. Ensure that the tests cover all major functionalities, edge cases, and error handling as defined by the utility functions and project requirements.

Import asserts from "@std/assert"

Import files in the src directory using "@/" e.g.
import { convertToPodcast } from '@/utils/audio/podcast.ts';

Do not mock any functions.

Do not test for edge cases.

Do not test for error handling.

This is a prototype so quality is secondary to rapid exploration of functionality.

**Target File for Test Generation:**

${content}
`;
}   