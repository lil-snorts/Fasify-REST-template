// application.js
import { buildAndStartServer } from './server.js'; // Adjust the path accordingly

const startServer = async () => {
    const server = await buildAndStartServer();
    return server;
};

startServer();
