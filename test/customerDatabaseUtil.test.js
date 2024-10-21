// tests/customerDatabaseUtil.test.js
import { expect } from 'chai';
import sinon from 'sinon';
import CustomerDatabaseUtil from '../src/customerDatabaseUtil.js';
import Database from '../src/database.js';
import { ClientError, ServerError } from '../src/errors.js';

describe('CustomerDatabaseUtil', () => {
    let databaseStub;
    let customerDatabaseUtil;

    beforeEach(() => {
        databaseStub = sinon.createStubInstance(Database);
        customerDatabaseUtil = new CustomerDatabaseUtil();
        customerDatabaseUtil._database = databaseStub;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should add a new customer', async () => {
        const newCustomer = { firstName: 'John', lastName: 'Doe', address: '123 Elm St', employeeId: 1 };

        databaseStub.addNewEntityAsync.resolves();

        await customerDatabaseUtil.addNewCustomerAsync(newCustomer);

        expect(databaseStub.addNewEntityAsync.calledOnce).to.be.true;
        expect(databaseStub.addNewEntityAsync.calledWith(newCustomer, 1)).to.be.true;
    });

    it('should throw error when adding a duplicate customer', async () => {
        const newCustomer = { firstName: 'John', lastName: 'Doe', address: '123 Elm St', employeeId: 1 };
        databaseStub.addNewEntityAsync
            .onFirstCall().resolves()
            .onSecondCall().throws(new ServerError("Database not configured to allow duplicate id's")); // Second call should throw an error

        await customerDatabaseUtil.addNewCustomerAsync(newCustomer);
        try {
            await customerDatabaseUtil.addNewCustomerAsync(newCustomer);
        } catch (error) {
            expect(error.message).to.equal("Database not configured to allow duplicate id's");
        }
    });

    it('should retrive customer entity', async () => {
        const customer = { firstName: 'John', lastName: 'Doe', address: '123 Elm St', employeeId: 1 };

        databaseStub.getEntityDataAsync.resolves({ id: 1, content: customer });

        const retrievedEntity = await customerDatabaseUtil.getCustomerAsync(customer.employeeId);

        expect(databaseStub.getEntityDataAsync.calledOnce).to.be.true;
        expect(databaseStub.getEntityDataAsync.calledWith(1)).to.be.true;
        expect(retrievedEntity).to.deep.equal(customer)
    });

    it('should throw ClientError when no entity found', async () => {
        databaseStub.getEntityDataAsync.resolves(null);

        try {
            await customerDatabaseUtil.getCustomerAsync(1);
        } catch (error) {
            expect(error).to.be.instanceOf(ClientError);
            expect(error.message).to.equal("No customer with that id")
        } finally {
            expect(databaseStub.getEntityDataAsync.calledOnce).to.be.true;
            expect(databaseStub.getEntityDataAsync.calledWith(1)).to.be.true;
        }

    });

    it('should throw ServerError when database throws unexpected error', async () => {
        databaseStub.getEntityDataAsync.throws(new Error("Unexpected"));
        try {
            await customerDatabaseUtil.getCustomerAsync(1);
        } catch (error) {
            expect(error).to.be.instanceOf(ServerError);
            expect(error.message).to.equal("Internal server error")
        } finally {
            expect(databaseStub.getEntityDataAsync.calledOnce).to.be.true;
            expect(databaseStub.getEntityDataAsync.calledWith(1)).to.be.true;
        }
    });
});
