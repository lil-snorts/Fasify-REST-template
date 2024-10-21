import { expect } from 'chai';
import sinon from 'sinon';
import Fastify from 'fastify';
import { build } from '../../src/server.js'; // Assuming this is your entry point
import CustomerDatabase from '../../src/customerDatabaseUtil.js';
import { ClientError } from '../../src/errors.js';
import fs from 'fs';
import path from 'path';

const TEST_DATABASE_FILE = 'test.json';

describe('Fastify Server - Validation and Error Handling', () => {
    let fastify;
    let customerDatabase;

    beforeEach(async () => {
        // Create a new instance of Fastify for each test
        fastify = Fastify({ logger: false });

        // Create a new instance of CustomerDatabase using a test database file
        customerDatabase = new CustomerDatabase(TEST_DATABASE_FILE);
        await customerDatabase.initialize();

        // Setup routes and error handlers as in the original server setup
        build(fastify, customerDatabase); // Assuming `build` initializes routes and uses the passed customerDatabase
    });

    afterEach(async () => {
        await fastify.close(); // Ensure Fastify is closed after each test
        sinon.restore(); // Restore all stubs
        // Remove the test database file
        const filePath = path.resolve(TEST_DATABASE_FILE);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    describe('GET /customers/:id - Validation', () => {
        it('should return 400 when id is not an integer', async () => {
            const response = await fastify.inject({
                method: 'GET',
                url: '/customers/abc', // Invalid ID
            });

            expect(response.statusCode).to.equal(400);
            expect(response.json().fault.code).to.equal('badRequest');
            expect(response.json().fault.failures[0].field).to.equal('id');
        });

        it('should return 200 with valid id', async () => {
            // Mock the customerDatabase to return a valid customer
            const mockCustomer = { content: { id: 1, firstName: 'John', lastName: 'Doe' } };
            sinon.stub(customerDatabase, 'getCustomerDataAsync').resolves(mockCustomer);

            const response = await fastify.inject({
                method: 'GET',
                url: '/customers/1', // Valid ID
            });

            expect(response.statusCode).to.equal(200);
            expect(response.json()).to.deep.equal(mockCustomer.content);
        });

        it('should throw a ClientError when customer is not found', async () => {
            sinon.stub(customerDatabase, 'getCustomerDataAsync').resolves(null); // Simulate no customer found

            const response = await fastify.inject({
                method: 'GET',
                url: '/customers/1',
            });

            expect(response.statusCode).to.equal(400);
            expect(response.json().fault.message).to.equal('You have supplied invalid request details');
        });
    });

    describe('POST /customers - Validation', () => {
        it('should return 400 when required fields are missing', async () => {
            const invalidCustomer = { firstName: 'Jane' }; // Missing lastName, address, employeeId

            const response = await fastify.inject({
                method: 'POST',
                url: '/customers',
                payload: invalidCustomer, // Payload with missing fields
            });

            expect(response.statusCode).to.equal(400);
            expect(response.json().fault.code).to.equal('badRequest');
            expect(response.json().fault.failures).to.have.lengthOf(3); // 3 required fields missing
        });

        it('should return 201 when customer is valid', async () => {
            const validCustomer = {
                firstName: 'Jane',
                lastName: 'Doe',
                address: '123 Main St',
                employeeId: 1001
            };

            sinon.stub(customerDatabase, 'addNewCustomerAsync').resolves(); // Mock successful insert

            const response = await fastify.inject({
                method: 'POST',
                url: '/customers',
                payload: validCustomer, // Valid customer payload
            });

            expect(response.statusCode).to.equal(201);
            expect(response.json().message).to.equal('Created successfully');
        });
    });
});
