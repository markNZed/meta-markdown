FROM denoland/deno:2.0.0-rc.6

# Install Python and pip for Jupyter
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Jupyter (you can include --break-system-packages if needed)
RUN pip3 install jupyter --break-system-packages && \
    pip3 install jupyter-ai --break-system-packages && \
    pip3 install langchain-openai --break-system-packages


RUN deno jupyter --unstable --install

# Expose ports for development
# Expose port for Deno (if you plan to run a Deno app later)
EXPOSE 1993

# Expose the default port for Jupyter
EXPOSE 8888

# Set working directory to /workspace for development
WORKDIR /workspace

# Ensure proper permissions for 'deno' user
RUN mkdir -p /home/deno/.deno /home/deno/.vscode-server \
    && chown -R deno:deno /home/deno

# Set the user back to 'deno' by default
#USER deno

# Ensure the container stays open, allowing VSCode to connect
CMD ["sleep", "infinity"]


