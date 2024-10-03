const handler = (_request: Request): Response => {
    const body = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Markdown Tool</title>
        </head>
        <body>
            <h1>Markdown Tool!</h1>
            <p>Welcome to the Markdown Tool!</p>
        </body>
        </html>
    `;
    return new Response(body, {
        headers: { "Content-Type": "text/html" },
    });
};

console.log("Server is running at http://localhost:8000");

// Use Deno.serve directly
Deno.serve({ port: 8000 }, handler);
  