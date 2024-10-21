import { expect } from 'chai';
import Fastify from 'fastify';
import { build } from '../../src/server.js'; // Assuming you export the server creation function
import sinon from 'sinon';
import customerDatabase from '../../src/customerDatabaseUtil.js';

describe('Customer Service', () => {
    let fastify;

    beforeEach(() => {
        fastify = build(); // Create a new instance of Fastify for each test
    });

    afterEach(async () => {
        sinon.restore(); // Restore all mocked/stubbed methods
    });

    describe('GET /customers/:id', () => {
        it('should return customer data for a valid id', async () => {
            const mockCustomerData = { content: { id: 1, firstName: 'John', lastName: 'Doe' } };
            sinon.stub(customerDatabase, 'getCustomerDataAsync').resolves(mockCustomerData);

            const response = await fastify.inject({
                method: 'GET',
                url: '/customers/1'
            });

            expect(response.statusCode).to.equal(200);
            expect(response.json()).to.deep.equal(mockCustomerData.content);
        });

        it('should return 400 for an invalid id', async () => {
            const response = await fastify.inject({
                method: 'GET',
                url: '/customers/invalid_id' // Invalid ID
            });

            expect(response.statusCode).to.equal(400);
            expect(response.json()).to.have.property('fault');
            expect(response.json().fault.code).to.equal('badRequest');
        });
    });

    describe('POST /customers', () => {
        it('should create a new customer', async () => {
            const newCustomer = {
                firstName: 'Jane',
                lastName: 'Doe',
                address: '123 Main St',
                employeeId: 1234
            };

            sinon.stub(customerDatabase, 'addNewCustomerAsync').resolves();

            const response = await fastify.inject({
                method: 'POST',
                url: '/customers',
                payload: newCustomer
            });

            expect(response.statusCode).to.equal(201);
            expect(response.json()).to.deep.equal({ message: 'Created successfully' });
        });

        it('should return 400 for missing required fields', async () => {
            const response = await fastify.inject({
                method: 'POST',
                url: '/customers',
                payload: { firstName: 'Jane' } // Missing required fields
            });

            expect(response.statusCode).to.equal(400);
            expect(response.json()).to.have.property('fault');
            expect(response.json().fault.code).to.equal('badRequest');
        });
    });
});
