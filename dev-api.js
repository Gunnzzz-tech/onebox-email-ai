// Development API server with reduced AI model verbosity
import { spawn } from 'child_process';

console.log('🔧 Starting API server in development mode...');

// Set environment variables to reduce AI model verbosity
process.env.NODE_ENV = 'development';
process.env.TRANSFORMERS_VERBOSE = 'false';

// Start the API server
const apiServer = spawn('npx', ['tsx', 'backend/api-server.ts'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env }
});

// Filter out verbose AI model warnings
apiServer.stdout.on('data', (data) => {
    const output = data.toString();
    // Only show important messages, filter out AI model warnings
    if (!output.includes('CleanUnusedInitializersAndNodeArgs') && 
        !output.includes('Removing initializer') &&
        output.trim().length > 0) {
        process.stdout.write(output);
    }
});

apiServer.stderr.on('data', (data) => {
    const output = data.toString();
    // Only show errors, not warnings
    if (!output.includes('CleanUnusedInitializersAndNodeArgs') && 
        !output.includes('Removing initializer')) {
        process.stderr.write(output);
    }
});

apiServer.on('close', (code) => {
    console.log(`API server exited with code ${code}`);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping API server...');
    apiServer.kill('SIGINT');
    process.exit(0);
});
