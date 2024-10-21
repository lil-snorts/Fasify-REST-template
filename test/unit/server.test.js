import { expect } from 'chai';
import sinon from 'sinon';
import Fastify from 'fastify';
import { build } from '../../src/server.js'; // Assuming this is your entry point
import customerDatabaseUtil from '../../src/customerDatabaseUtil.js';
import { ClientError } from '../../src/errors.js';

describe('Fastify Server - Validation and Error Handling', () => {
    let fastify;

    beforeEach(() => {
        // Create a new instance of Fastify for each test
        fastify = Fastify({ logger: false });
        // Setup routes and error handlers as in the original server setup
        createRestRoutes();
        setServerErrorHandler();
    });

    afterEach(async () => {
        await fastify.close(); // Ensure Fastify is closed after each test
        sinon.restore(); // Restore all stubs
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
            // Mock the databaseUtil to return a valid customer
            const mockCustomer = { content: { id: 1, firstName: 'John', lastName: 'Doe' } };
            sinon.stub(customerDatabaseUtil, 'getCustomerDataAsync').resolves(mockCustomer);

            const response = await fastify.inject({
                method: 'GET',
                url: '/customers/1', // Valid ID
            });

            expect(response.statusCode).to.equal(200);
            expect(response.json()).to.deep.equal(mockCustomer.content);
        });

        it('should throw a ClientError when customer is not found', async () => {
            sinon.stub(customerDatabaseUtil, 'getCustomerDataAsync').resolves(null); // Simulate no customer found

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

            sinon.stub(customerDatabaseUtil, 'addNewCustomerAsync').resolves(); // Mock successful insert

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
