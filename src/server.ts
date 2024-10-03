// Import necessary Deno APIs
import { serveFile } from "https://deno.land/std@0.203.0/http/file_server.ts";

// Define the directory where public assets are stored
const PUBLIC_DIR = "public";

// WebSocket handling logic
const sockets: WebSocket[] = [];

// Function to handle WebSocket connections
function handleWebSocket(socket: WebSocket) {
  sockets.push(socket);

  socket.onclose = () => {
    const index = sockets.indexOf(socket);
    if (index !== -1) {
      sockets.splice(index, 1);
    }
  };

  socket.onerror = (event) => {
    console.error("WebSocket error observed:", event);
  };

  socket.onmessage = (event) => {
    console.log("Received message:", event.data);
  };
}

// Function to watch for changes in the public directory
async function watchFiles() {
  const watcher = Deno.watchFs([`${PUBLIC_DIR}/app.html`, `${PUBLIC_DIR}/app.js`]);
  for await (const event of watcher) {
    if (event.kind === "modify") {
      for (const path of event.paths) {
        if (path.endsWith("app.html")) {
          console.log("app.html changed, notifying clients...");
          sockets.forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send("reload-app-html");
            }
          });
        } else if (path.endsWith("app.js")) {
          console.log("app.js changed, notifying clients...");
          sockets.forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send("reload-app-js");
            }
          });
        }
      }
    }
  }
}

// Helper function to sanitize and map URLs to file paths
function mapUrlToFilePath(pathname: string): string | null {
  // Prevent directory traversal attacks
  if (pathname.includes("..")) {
    return null;
  }

  // Remove query parameters
  pathname = pathname.split("?")[0];

  // If the request is to the root, serve index.html
  if (pathname === "/") {
    return `${PUBLIC_DIR}/index.html`;
  }

  // Special handling for WebSocket and favicon
  if (pathname === "/ws" || pathname === "/favicon.ico") {
    return pathname; // Handled separately
  }

  // Map the pathname to the public directory
  return `${PUBLIC_DIR}${pathname}`;
}

// Main handler function
const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  let { pathname } = url;

  console.log(`Incoming request for: ${pathname}`);

  // Handle WebSocket upgrade
  if (pathname === "/ws") {
    const { socket, response } = Deno.upgradeWebSocket(request);
    handleWebSocket(socket);
    console.log("WebSocket connection established.");
    return response;
  }

  // Handle favicon.ico
  if (pathname === "/favicon.ico") {
    const faviconPath = `${PUBLIC_DIR}/favicon.ico`;
    try {
      return await serveFile(request, faviconPath);
    } catch {
      return new Response(null, { status: 204 });
    }
  }

  // Map URL to file path
  const filePath = mapUrlToFilePath(pathname);
  if (filePath === null) {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    return await serveFile(request, filePath);
  } catch (error) {
    console.error(`Error serving ${filePath}:`, error);
    return new Response("Not Found", { status: 404 });
  }
};

// Start the server using Deno.serve API
console.log("Server is running at http://localhost:8000");
Deno.serve({ port: 8000 }, handler);

// Start watching the files for changes
watchFiles();
