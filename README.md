# AI-Powered Markdown (MD) File Manipulation Tool

## Overview

This tool integrates with Visual Studio Code (VS Code) to provide AI-enhanced manipulation and management of Markdown (MD) files. Leveraging the OpenAI API, it offers functionality within VS Code Notebooks.

## Setup

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd meta-markdown
   ```
2. **Mount markdown directory:**
   - Modify docker-compose.yml to mount your directory at /markdown

3. **Configure AI Service:**
   - Rename `.env.example` to `.env` and add your OpenAI API key.

4. **Run devcontainer from VS Code**
   - Use Dev Containers extension to launch
   ```

5. **Run Notebook:**
   - Open the `src/notebooks/demo.ipynb` in VS Code and execute cells for AI-based manipulations.
