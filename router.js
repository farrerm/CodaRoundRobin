const express = require('express');
const http = require('http');

const app = express();
const PORT = 4000;

// Middleware to parse JSON bodies
app.use(express.json());

// List of backend servers
const servers = [
    'http://localhost:3000', // Server 1
    'http://localhost:3001', // Server 2
    'http://localhost:3002'  // Server 3
];

let currentIndex = 0;

// Middleware to handle round robin routing
app.post('/api', (req, res) => {
    const serverUrl = new URL(servers[currentIndex]);

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
        });
    });

    proxyReq.on('error', (error) => {
        console.error(`Error forwarding request to ${serverUrl}:`, error.message);
        
        // Handle different types of errors
        res.status(500).send('Internal Server Error');
    });

    // Write the request body to the proxy request
    proxyReq.write(JSON.stringify(req.body));
    proxyReq.end();

    // Update the index for the next request
    currentIndex = (currentIndex + 1) % servers.length;
});

// Start the server
app.listen(PORT, () => {
    console.log(`Round Robin Router listening on port ${PORT}`);
});
