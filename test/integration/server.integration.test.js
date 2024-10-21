import { expect } from 'chai';
import sinon from 'sinon';
import Fastify from 'fastify';
import request from 'supertest';
import CustomerDatabaseUtil from '../../src/customerDatabaseUtil.js';
import { ClientError, ServerError } from '../../src/errors.js';
import { build } from '../../src/server.js';

describe('Fastify Server Integration Tests', () => {
    let fastifyServer;
    let customerDatabaseUtilStub;

    before(async () => {
        // Create a Fastify instance
        fastifyServer = build();

        // Create a stub for the CustomerDatabaseUtil class
        customerDatabaseUtilStub = sinon.createStubInstance(CustomerDatabaseUtil);
        fastifyServer.customerDatabaseUtil = customerDatabaseUtilStub;
    });

    after(async () => {
        await fastifyServer.close();
    });

    describe('POST /customers', () => {
        it('should return 400 for bad requests (missing fields)', async () => {
            // Arrange
            const invalidCustomerDto = { name: 'John Doe' }; // Missing employeeId

            // Act
            const response = await request(fastifyServer.server).post('/customers').send(invalidCustomerDto);

            // Assert
            expect(response.status).to.equal(400);
            expect(response.body.fault.code).to.equal('badRequest');
            expect(response.body.fault.message).to.equal('You have supplied invalid request details');
            expect(customerDatabaseUtilStub.addNewCustomerAsync.notCalled).to.be.true; // Ensure DB not called
        });

        it('should return 400 for requests with too many fields', async () => {
            // Arrange
            const invalidCustomerDto = { employeeId: '1', name: 'John Doe', age: 30, extraField: 'extraValue' };

            // Act
            const response = await request(fastifyServer.server).post('/customers').send(invalidCustomerDto);

            // Assert
            expect(response.status).to.equal(400);
            expect(response.body.fault.code).to.equal('badRequest');
            expect(response.body.fault.message).to.equal('You have supplied invalid request details');
            expect(customerDatabaseUtilStub.addNewCustomerAsync.notCalled).to.be.true; // Ensure DB not called
        });

        it('should return 400 for duplicate requests', async () => {
            // Arrange
            const customerDto = { employeeId: '1', name: 'John Doe' };
            customerDatabaseUtilStub.addNewCustomerAsync.throws(new ServerError("Database not configured to allow duplicate ids"));

            // Act
            const response = await request(fastifyServer.server).post('/customers').send(customerDto);

            // Assert
            expect(response.status).to.equal(500); // Ensure server error returned for duplicate
            expect(response.body.fault.code).to.equal('internalError');
            expect(response.body.fault.message).to.equal('An internal error was encountered processing the request');
        });

        it('should return 500 for generic database errors', async () => {
            // Arrange
            const customerDto = { employeeId: '2', name: 'Jane Doe' };
            customerDatabaseUtilStub.addNewCustomerAsync.throws(new Error("Generic DB error"));

            // Act
            const response = await request(fastifyServer.server).post('/customers').send(customerDto);

            // Assert
            expect(response.status).to.equal(500);
            expect(response.body.fault.code).to.equal('internalError');
            expect(response.body.fault.message).to.equal('An internal error was encountered processing the request');
        });
    });

    describe('GET /customers/:id', () => {
        it('should return 400 for invalid customer ID format', async () => {
            // Arrange
            const invalidCustomerId = 'invalid-id'; // Invalid format

            // Act
            const response = await request(fastifyServer.server).get(`/customers/${invalidCustomerId}`);

            // Assert
            expect(response.status).to.equal(400);
            expect(response.body.fault.code).to.equal('badRequest');
            expect(response.body.fault.message).to.equal('You have supplied invalid request details');
        });

        it('should return 400 for non-existing customer ID', async () => {
            // Arrange
            const customerId = 'non-existing-id';
            customerDatabaseUtilStub.getCustomerAsync.throws(new ClientError("No customer with that id"));

            // Act
            const response = await request(fastifyServer.server).get(`/customers/${customerId}`);

            // Assert
            expect(response.status).to.equal(400);
            expect(response.body.fault.code).to.equal('badRequest');
            expect(response.body.fault.message).to.equal('You have supplied invalid request details');
        });
    });
});
