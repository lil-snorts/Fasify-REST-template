// tests/application.test.js
import { expect } from 'chai';
import { buildAndStartServer } from '../src/server.js';

describe('Application', () => {
    it('should start the server without errors', async () => {
        const server = await buildAndStartServer();
        expect(server).to.exist;
        await server.close(); // Close server after test
    });
});
