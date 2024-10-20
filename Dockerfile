FROM denoland/deno

# Install Python and pip for Jupyter
# default-jre && graphviz for plantuml extension
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-dev git \
    ffmpeg \
    sudo \
    curl \
    vim \
    procps \
    default-jre \
    graphviz \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Jupyter (you can include --break-system-packages if needed)
RUN pip3 install jupyter --break-system-packages

# Install the Deno Jupyter kernel before switching to the 'deno' user
RUN deno jupyter --unstable --install

RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*


# Expose the default port for Jupyter
EXPOSE 8888

# Set working directory to /workspace for development
WORKDIR /workspace

# Set the desired UID and GID (1000 is common for local users)
ARG USER_ID=1000
ARG GROUP_ID=1000

# deno user exists in denoland/deno container

# Create a 'deno' user with a specific UID and GID
RUN groupmod -g ${GROUP_ID} deno && \
    usermod -u ${USER_ID} -g ${GROUP_ID} deno && \
    mkdir -p /home/deno && \
    chown -R deno:deno /home/deno /deno-dir /workspace /usr/local/share/jupyter

# Add 'deno' user to the 'sudo' group
RUN usermod -aG sudo deno

# Configure passwordless sudo for 'sudo' group members
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Set the user back to 'deno' by default
USER deno

RUN deno jupyter --unstable --install

# Start Jupyter Notebook on container startup (use the full path to Python's Jupyter)
CMD ["/usr/local/bin/jupyter", "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--NotebookApp.token=''"]
