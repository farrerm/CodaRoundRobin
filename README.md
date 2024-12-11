# Round Robin Router Take-home Assignment


<span style="font-size: 24px;">This repo contains the code for our take-home assignment for Coda.   </span>

<span style="font-size: 24px;">There are two important files.  router.js has the code for the round robin router itself, while app.js has the code for the app server.  </span>

<span style="font-size: 24px;">The router expects the app servers to run on localhost, on specific ports.  We have hardcoded addresses for 3 app instances in the router.  The router can use any port, although preferably it should use one that is not used by the app servers. </span>

# Installation
<span style="font-size: 24px;">Clone the Git repository.  Navigate to the root and run:</span>
```bash
npm install
```  
# Running Servers
<span style="font-size: 24px;">Navigate to the root of the project.  Open a terminal and type:</span>

```bash
<terminal 1>
node router.js 4000
```  
<span style="font-size: 24px;">This will start an instance of the router using port 4000.</span>

<span style="font-size: 24px;">Open three more terminals.  Enter the commands:</span>

```bash
<terminal 2>
node app.js 3000
```  
```bash
<new terminal 3>
node app.js 3001
```  
```bash
<new terminal 4>
node app.js 3002
```  
<span style="font-size: 24px;">This will launch 3 instances of the application server, at the ports on localhost that are expected by the router.</span>

<span style="font-size: 24px;">At this point you can begin sending http requests over localhost to the router's /api endpoint.  It will route the requests to the app servers in a round robin fashion.  We used Postman for sending the requests.  </span>

<span style="font-size: 24px;">We are happy to provide more details during the presention.</span>




