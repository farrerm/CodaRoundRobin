const express = require("express");
//const bodyParser = require('body-parser');
const app = express();
const port = process.argv[2] || 3000;

app.use(express.json());

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log("Incoming Request:");
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  console.log(`Body: ${JSON.stringify(req.body)}`);

  // Listen for the abort event on the request object
  req.on("aborted", () => {
    console.log("Request was aborted by the client.");
  });

  next(); // Proceed to the next middleware or route handler
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" }); // Respond with a 200 OK status
});

app.post("/api", (req, res) => {
  // Handle POST requests here
  res.json({
    message: `Received POST request on port ${port}`,
    data: req.body,
  });
});

// Shutdown endpoint
app.post("/shutdown", (req, res) => {
  console.log("Shutting down server...");
  res.send("Server is shutting down...");
  server.close(() => {
    console.log("Server closed gracefully.");
    process.exit(0); // Exit with success code
  });
});

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

process.on("SIGINT", () => {
  console.log(`Shutting down server on port ${port}...`);
  server.close(() => {
    console.log(`Server on port ${port} closed.`);
    process.exit(0); // Exit the process
  });
});
