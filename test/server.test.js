// tests/server.test.js
import { expect } from 'chai';
import sinon from 'sinon';
import { createServerInstance } from '../src/server.js';
import CustomerDatabaseUtil from '../src/customerDatabaseUtil.js';

describe('FastifyServer REST Routes', () => {
    let server;
    let customerDatabaseUtilStub;

    beforeEach(async () => {
        server = createServerInstance();
        customerDatabaseUtilStub = sinon.stub(CustomerDatabaseUtil.prototype);

        // Replace the actual database util with the stub
        server.customerDatabaseUtil = customerDatabaseUtilStub;
        await server.ready();
    });

    afterEach(() => {
        sinon.restore(); // Restore original functionality
    });

    it('should retrieve a customer by id', async () => {
        const mockCustomer = { firstName: 'John', lastName: 'Doe', address: '123 Elm St', employeeId: 1 };

        customerDatabaseUtilStub.getCustomerAsync.resolves(mockCustomer);

        const response = await server.inject({
            method: 'GET',
            url: '/customers/1'
        });

        expect(response.statusCode).to.equal(200);
        expect(response.json()).to.deep.equal(mockCustomer);
        expect(customerDatabaseUtilStub.getCustomerAsync.calledOnce).to.be.true;
    });

    it('should add a new customer', async () => {
        const newCustomer = { firstName: 'Jane', lastName: 'Doe', address: '456 Maple St', employeeId: 2 };

        customerDatabaseUtilStub.addNewCustomerAsync.resolves();

        const response = await server.inject({
            method: 'POST',
            url: '/customers',
            payload: newCustomer
        });

        expect(response.statusCode).to.equal(201);
        expect(response.json()).to.deep.equal({ message: 'Created successfully' });
        expect(customerDatabaseUtilStub.addNewCustomerAsync.calledOnceWith(newCustomer)).to.be.true;
    });

    it('should handle errors when retrieving a customer', async () => {
        customerDatabaseUtilStub.getCustomerAsync.rejects(new Error("No customer with that id"));

        const response = await server.inject({
            method: 'GET',
            url: '/customers/999'
        });

        expect(response.statusCode).to.equal(500);
        expect(response.json().fault.message).to.equal('An internal error was encountered processing the request');
    });
});
