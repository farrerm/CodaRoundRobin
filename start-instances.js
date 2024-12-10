const { spawn } = require('child_process');

const ports = [3000, 3001, 3002];
const instances = []

ports.forEach(port => {
  const instance = spawn('node', ['app.js', port]);
  
  instance.stdout.on('data', (data) => {
    console.log(`Instance on port ${port}: ${data}`);
  });

  instance.stderr.on('data', (data) => {
    console.error(`Instance on port ${port} error: ${data}`);
  });
  instances.push(instance); // Store reference to each instance
});

// Handle SIGINT for parent process
process.on('SIGINT', () => {
  console.log('Shutting down all instances...');
  
  instances.forEach((instance, index) => {
    instance.kill('SIGINT'); // Send SIGINT to each child process
    console.log(`Instance on port ${ports[index]} terminated.`);
  });

  // Allow some time for children to shut down before exiting
  setTimeout(() => {
    process.exit(0); // Exit the parent process
  }, 1000); // Wait for 1 second

  //process.exit(0); // Exit the parent process
});
