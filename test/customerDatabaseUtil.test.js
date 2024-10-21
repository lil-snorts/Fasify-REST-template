// tests/customerDatabaseUtil.test.js
import { expect } from 'chai';
import sinon from 'sinon';
import CustomerDatabaseUtil from '../src/customerDatabaseUtil.js';
import Database from '../src/database.js';
import { ServerError } from '../src/errors.js';

describe('CustomerDatabaseUtil', () => {
    let databaseStub;
    let customerDatabaseUtil;

    beforeEach(() => {
        databaseStub = sinon.createStubInstance(Database);
        customerDatabaseUtil = new CustomerDatabaseUtil();
        customerDatabaseUtil._database = databaseStub; // Mock database instance
    });

    afterEach(() => {
        sinon.restore(); // Restore original functionality
    });

    it('should add a new customer', async () => {
        const newCustomer = { firstName: 'John', lastName: 'Doe', address: '123 Elm St', employeeId: 1 };

        databaseStub.addNewEntityAsync.resolves(); // Mock successful addition

        await customerDatabaseUtil.addNewCustomerAsync(newCustomer);

        expect(databaseStub.addNewEntityAsync.calledOnce).to.be.true;
        expect(databaseStub.addNewEntityAsync.calledWith(newCustomer, 1)).to.be.true;
    });

    it('should throw error when adding a duplicate customer', async () => {
        const newCustomer = { firstName: 'John', lastName: 'Doe', address: '123 Elm St', employeeId: 1 };
        databaseStub.addNewEntityAsync
            .onFirstCall().resolves()  // First call should succeed
            .onSecondCall().throws(new ServerError("Database not configured to allow duplicate id's")); // Second call should throw an error

        await customerDatabaseUtil.addNewCustomerAsync(newCustomer);
        try {
            await customerDatabaseUtil.addNewCustomerAsync(newCustomer);
        } catch (error) {
            expect(error.message).to.equal("Database not configured to allow duplicate id's");
        }
    });
});
