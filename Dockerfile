FROM denoland/deno

# Install Python and pip for Jupyter
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev git && \
    apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Jupyter (you can include --break-system-packages if needed)
RUN pip3 install jupyter --break-system-packages

# Install the Deno Jupyter kernel before switching to the 'deno' user
RUN deno jupyter --unstable --install

# Expose the default port for Jupyter
EXPOSE 8888

# Set working directory to /workspace for development
WORKDIR /workspace

# Set the desired UID and GID (1000 is common for local users)
ARG USER_ID=1000
ARG GROUP_ID=1000

# Create a 'deno' user with a specific UID and GID
RUN groupmod -g ${GROUP_ID} deno && \
    usermod -u ${USER_ID} -g ${GROUP_ID} deno && \
    mkdir -p /home/deno && \
    chown -R deno:deno /home/deno /deno-dir /workspace /usr/local/share/jupyter

# Set the user back to 'deno' by default
USER deno

# Start Jupyter Notebook on container startup (use the full path to Python's Jupyter)
CMD ["/usr/local/bin/jupyter", "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--NotebookApp.token=''"]
