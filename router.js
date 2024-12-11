const express = require('express');
const http = require('http');

const app = express();
const PORT = 4000;

// Middleware to parse JSON bodies
app.use(express.json());

// List of backend servers
let servers = [
    { url: 'http://localhost:3000', active: true }, // Server 1
    { url: 'http://localhost:3001', active: true }, // Server 2
    { url: 'http://localhost:3002', active: true }  // Server 3
];

let currentIndex = 0;

// Middleware to handle round robin routing
app.post('/api', (req, res) => {
    const originalIndex = currentIndex; // Keep track of the original index
    forwardRequest(req, res, originalIndex); // Start forwarding requests
});

// function to forward requests
const forwardRequest = (req, res, originalIndex) => {

    const currentServer = servers[currentIndex];
    
    if (!currentServer.active) {
        //skip inactive servers
        console.log(`Skipping inactive server: ${currentServer.url}`);
        // Move to the next server and try again
        currentIndex = (currentIndex + 1) % servers.length;

        // Check if we've cycled through all servers
        if (currentIndex !== originalIndex) {
            forwardRequest(req, res, originalIndex); // Recursively try the next server
        } else {
            return res.status(502).json({
                message: 'Bad Gateway: Unable to connect to any application server.'
            });
        }
        return; // Exit early since we won't proceed with an inactive server
    }

    const serverUrl = new URL(currentServer.url);
        
    // Log the request details before sending it to the backend server
    console.log(`Forwarding request to ${serverUrl}`);
    console.log(`Request Method: POST`);
    console.log(`Request URL: ${serverUrl}${req.originalUrl}`);
    console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
    const fullRequestUrl = `${serverUrl}${req.originalUrl}`;
    console.log(`Full request URL: ${fullRequestUrl}`);

    const options = {
        hostname: serverUrl.hostname,
        port: serverUrl.port, 
        path: req.originalUrl,
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
        
        let responseBody = '';

        proxyRes.on('data', (chunk) => {
            responseBody += chunk;
        });

        proxyRes.on('end', () => {
            res.status(proxyRes.statusCode).send(responseBody);
            currentIndex = (currentIndex + 1) % servers.length; // Move to next server for next request
        });
    });
    
    proxyReq.on('error', (error) => {
        console.error(`Error forwarding request to ${serverUrl}:`, error.message);
        
        // Handle specific error types
        if (error.code === 'ECONNREFUSED') {
            currentServer.active = false; // Mark server as inactive
            console.error(`Marking server ${currentServer.url} as inactive due to ECONNREFUSED.`);
            // Continue to the next server without sending a response yet
            currentIndex = (currentIndex + 1) % servers.length;
                
            if (currentIndex !== originalIndex) {
                forwardRequest(req, res, originalIndex); 
            } else {
                return res.status(502).json({
                    message: 'Bad Gateway: Unable to connect to any application server.'
                });
            }
        } else {
            // Handle other types of errors
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message // Optionally include the original error message
            });
        }
    });
    // Write the request body to the proxy request
    proxyReq.write(JSON.stringify(req.body));
    proxyReq.end();

};

// Health check function for backend servers
const checkServerHealth = (server) => {
    const options = {
        hostname: new URL(server.url).hostname,
        port: new URL(server.url).port,
        path: '/health',
        method: 'GET',
    };

    const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
            server.active = true; // Mark as active if healthy
            console.log(`Server ${server.url} is online.`);
        } else {
            server.active = false; // Mark as inactive if not healthy
            console.error(`Health check failed for ${server.url}: Status code ${res.statusCode}`);
        }
    });

    req.on('error', () => {
        server.active = false; // Mark as inactive on error
        console.error(`Health check error for ${server.url}`);
    });

    req.end();
};

// Start the server
app.listen(PORT, () => {
    console.log(`Round Robin Router listening on port ${PORT}`);
});
