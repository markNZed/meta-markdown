# AI-Powered Markdown Manipulation Tool

## Overview

An AI-powered tool for manipulating and managing Markdown files, supporting both script-based and notebook-based workflows. Leveraging the OpenAI API, it provides features for editing, summarizing, and converting Markdown content. Deno is used instead of node for javasript/typescript execution and the deno kernel is used with Jupyter to provide javsacript/typescript notebooks.

## Setup

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd meta-markdown
   ```

2. **Mount Markdown Directory:**

   - Modify `docker-compose.yml` to mount your directory at `/markdown`. For example:

     ```yaml
     services:
       devcontainer:
         volumes:
           - ./your-markdown-directory:/markdown
     ```

3. **Configure AI Service:**

   - Copy `.env.example` to `.env` and add your OpenAI API key:

     ```bash
     cp .env.example .env
     ```

     Edit `.env` and set your OpenAI API key:

     ```
     OPENAI_API_KEY=your-openai-api-key
     ```

4. **Run Dev Container from VS Code:**

   - Open the project in VS Code.
   - Install the **Dev Containers** extension if not already installed.
   - Use **Reopen in Container** to launch the development environment.

5. **Install VS Code Extensions:**

   - Install the following extensions:

     - **Deno** (`denoland.vscode-deno`)
     - **Jupyter** (`ms-toolsai.jupyter`)

## Usage

### Script-Based Approach

#### Running Scripts
    ```
- **Watching Scripts:**

  - To watch scripts for changes and automatically re-run them:

    ```bash
    deno task watch-scripts
    ```

#### Available Scripts

- **`demo.ts`**

  - Demonstrates Markdown manipulation and AI integration.
  - Performs tasks like inserting headings, summarizing content, improving style, and checking grammar.

- **`demoUI.ts`**

  - Shows a simple UI interaction example using alert, confirm, and prompt dialogs.


#### Running Specific Scripts

- To run a specific script, use the `deno run` command with necessary permissions. For example:

  ```bash
  deno run --allow-read --allow-write src/scripts/grammarCheck.js
  ```

  Adjust the permissions as required by the script.

### Notebook-Based Approach

#### Running Notebooks

- **Opening Notebooks:**

  - Open the `.ipynb` files in the `src/notebooks` directory using VS Code.

- **Executing Cells:**

  - Execute the cells to perform AI-based manipulations on Markdown content.

- **Notes:**

  - Ensure that the Jupyter extension is installed and that the Deno kernel is available.
  - Deno caches imports, so you may need to restart the kernel to refresh dependencies.

## Configuration

- **Environment Variables:**

  - **`OPENAI_API_KEY`**: Your OpenAI API key.
  - **`OPENAI_MODEL`**: The OpenAI model to use (default is specified in `config.ts`).
  - **`MARKDOWN_DIR`**: The directory where your Markdown files are located.

- **Configuration File:**

  - `config.ts` contains configuration settings that can be customized.

## Additional Notes

- **Dependencies and Import Maps:**

  - The project uses Deno for dependency management.
  - Dependencies are specified in `import_map.json`.

- **Logging and Debugging:**

  - The tool includes logging utilities (`logger.ts`) to assist with debugging.

- **AI Models and Limits:**

  - Be aware of the OpenAI API limits and associated costs.

- **Markdown Directory:**

  - The default Markdown directory is `/workspace/markdown_example` but can be customized in `config.ts` or via environment variables.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.