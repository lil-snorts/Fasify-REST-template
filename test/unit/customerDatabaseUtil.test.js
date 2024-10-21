import { expect } from 'chai';
import sinon from 'sinon';
import CustomerDatabaseUtil from '../../src/customerDatabaseUtil.js'; // Adjust the path accordingly
import Database from '../../src/database.js'; // Adjust the path accordingly
import { ClientError, ServerError } from '../../src/errors.js';

describe('CustomerDatabaseUtil Class', () => {
    let customerDatabaseUtil;
    let databaseStub;

    beforeEach(async () => {
        // Create a stub for the Database class
        databaseStub = sinon.createStubInstance(Database);
        customerDatabaseUtil = new CustomerDatabaseUtil();
        customerDatabaseUtil._database = databaseStub;
        await customerDatabaseUtil.init();
    });

    afterEach(() => {
        // Restore original functionality
        sinon.restore();
    });

    describe('init', () => {
        it('should initialize the database', async () => {
            // Act
            await customerDatabaseUtil.init();

            // Assert
            expect(databaseStub.initialize.calledOnce).to.be.true;
        });
    });

    describe('addNewCustomerAsync', () => {
        it('should add a new customer successfully', async () => {
            // Arrange
            const customerDto = { employeeId: '1', name: 'John Doe' };

            // Act
            await customerDatabaseUtil.addNewCustomerAsync(customerDto);

            // Assert
            expect(databaseStub.addNewEntityAsync.calledOnceWith(customerDto, customerDto.employeeId)).to.be.true;
        });

        it('should throw a ServerError if the database throws an error', async () => {
            // Arrange
            const customerDto = { employeeId: '2', name: 'Jane Doe' };
            databaseStub.addNewEntityAsync.throws(new ServerError("Some server error"));

            // Act & Assert
            await expect(customerDatabaseUtil.addNewCustomerAsync(customerDto)).to.be.rejectedWith(ServerError, "Some server error");
        });

        it('should throw a ServerError for unknown errors', async () => {
            // Arrange
            const customerDto = { employeeId: '3', name: 'Jim Doe' };
            databaseStub.addNewEntityAsync.throws(new Error("Unexpected error"));

            // Act & Assert
            await expect(customerDatabaseUtil.addNewCustomerAsync(customerDto)).to.be.rejectedWith(ServerError, "Internal server error");
        });
    });

    describe('getCustomerAsync', () => {
        it('should return customer data if it exists', async () => {
            // Arrange
            const customerIdentifier = '1';
            const customerData = { employeeId: '1', name: 'John Doe' };
            databaseStub.getEntityDataAsync.resolves({ id: customerIdentifier, content: customerData });

            // Act
            const result = await customerDatabaseUtil.getCustomerAsync(customerIdentifier);

            // Assert
            expect(result).to.deep.equal(customerData);
            expect(databaseStub.getEntityDataAsync.calledOnceWith(customerIdentifier)).to.be.true;
        });

        it('should throw a ClientError if the customer does not exist', async () => {
            // Arrange
            const customerIdentifier = 'non-existing-id';
            databaseStub.getEntityDataAsync.resolves(null);

            // Act & Assert
            await expect(customerDatabaseUtil.getCustomerAsync(customerIdentifier)).to.be.rejectedWith(ClientError, "No customer with that id");
        });

        it('should throw a ServerError for unknown errors', async () => {
            // Arrange
            const customerIdentifier = '1';
            databaseStub.getEntityDataAsync.throws(new Error("Unexpected error"));

            // Act & Assert
            await expect(customerDatabaseUtil.getCustomerAsync(customerIdentifier)).to.be.rejectedWith(ServerError, "Internal server error");
        });
    });
});
