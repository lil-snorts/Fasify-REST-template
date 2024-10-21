import { expect } from 'chai';
import sinon from 'sinon';
import Fastify from 'fastify';
import request from 'supertest';
import CustomerDatabaseUtil from '../../src/customerDatabaseUtil.js';
import { ClientError, ServerError } from '../../src/errors.js';
import { build } from '../../src/server.js'; // Adjust the path accordingly

describe('Fastify Server', () => {
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

    describe('GET /customers/:id', () => {
        it('should return customer data if it exists', async () => {
            // Arrange
            const customerId = '1';
            const customerData = { employeeId: '1', name: 'John Doe' };
            customerDatabaseUtilStub.getCustomerAsync.resolves(customerData);

            // Act
            const response = await request(fastifyServer.server).get(`/customers/${customerId}`);

            // Assert
            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal(customerData);
            expect(customerDatabaseUtilStub.getCustomerAsync.calledOnceWith(customerId)).to.be.true;
        });

        it('should return a ClientError if the customer does not exist', async () => {
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

        it('should return a ServerError for unknown errors', async () => {
            // Arrange
            const customerId = '1';
            customerDatabaseUtilStub.getCustomerAsync.throws(new Error("Unexpected error"));

            // Act
            const response = await request(fastifyServer.server).get(`/customers/${customerId}`);

            // Assert
            expect(response.status).to.equal(500);
            expect(response.body.fault.code).to.equal('internalError');
            expect(response.body.fault.message).to.equal('An internal error was encountered processing the request');
        });
    });

    describe('POST /customers', () => {
        it('should create a new customer successfully', async () => {
            // Arrange
            const customerDto = { employeeId: '1', name: 'John Doe' };
            customerDatabaseUtilStub.addNewCustomerAsync.resolves();

            // Act
            const response = await request(fastifyServer.server).post('/customers').send(customerDto);

            // Assert
            expect(response.status).to.equal(201);
            expect(response.body.message).to.equal('Created successfully');
            expect(customerDatabaseUtilStub.addNewCustomerAsync.calledOnceWith(customerDto)).to.be.true;
        });

        it('should return a ServerError if the database throws an error', async () => {
            // Arrange
            const customerDto = { employeeId: '2', name: 'Jane Doe' };
            customerDatabaseUtilStub.addNewCustomerAsync.throws(new ServerError("Some server error"));

            // Act
            const response = await request(fastifyServer.server).post('/customers').send(customerDto);

            // Assert
            expect(response.status).to.equal(500);
            expect(response.body.fault.code).to.equal('internalError');
            expect(response.body.fault.message).to.equal('An internal error was encountered processing the request');
        });

        it('should return a ClientError for invalid requests', async () => {
            // Arrange
            const customerDto = { employeeId: '3', name: 'Invalid User' };
            customerDatabaseUtilStub.addNewCustomerAsync.throws(new ClientError("Invalid data"));

            // Act
            const response = await request(fastifyServer.server).post('/customers').send(customerDto);

            // Assert
            expect(response.status).to.equal(400);
            expect(response.body.fault.code).to.equal('badRequest');
            expect(response.body.fault.message).to.equal('You have supplied invalid request details');
        });
    });
});
