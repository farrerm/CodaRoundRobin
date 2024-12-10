const express = require('express');
const axios = require('axios');

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
app.post('/api', async (req, res) => {
    const serverUrl = servers[currentIndex];

    // Log the request details before sending it to the backend server
    console.log(`Forwarding request to ${serverUrl}`);
    console.log(`Request Method: POST`);
    console.log(`Request URL: ${serverUrl}${req.originalUrl}`);
    console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
    const fullRequestUrl = `${serverUrl}${req.originalUrl}`;
    console.log(`Full request URL: ${fullRequestUrl}`);

    const headersToSend = {
      //...req.headers, // Spread operator to copy existing headers
      'Content-Type': 'application/json' // Example of adding a custom header
      // You can modify or remove any headers as needed
      // For example, delete a header:
      // 'Authorization': undefined // This will remove the Authorization header if present
  };

    try {
        const response = await axios({
            method: 'POST',
            url: `${serverUrl}${req.originalUrl}`, // Forwarding original URL
            data: req.body, // Forwarding request body
            headers: headersToSend, // Forwarding headers
            timeout: 10000 // Set a timeout of 5 seconds
        });
        

        // Send the response from the server back to the client
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error(`Error forwarding request to ${serverUrl}:`, error.message);
        
        // Handle different types of errors
        if (error.response) {
            // The server responded with a status code outside the range of 2xx
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(504).send('Gateway Timeout: No response from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).send('Internal Server Error');
        }
    }

    // Update the index for the next request
    currentIndex = (currentIndex + 1) % servers.length;
});

// Start the server
app.listen(PORT, () => {
    console.log(`Round Robin Router listening on port ${PORT}`);
});
