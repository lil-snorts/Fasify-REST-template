// tests/database.test.js
import { expect } from 'chai';
import sinon from 'sinon';
import Database from '../src/database.js';
import { ServerError } from '../src/errors.js';
describe('Database', () => {
    let database;

    beforeEach(async () => {
        database = new Database('testDatabase.json'); // Use a test database file
        await database.initialize();
        await database.deleteAll();
        expect(database._database).to.exist;
    });

    afterEach(() => {
        sinon.restore(); // Restore original functionality
    });


    it('should add a new entity', async () => {
        await database.deleteAll();
        const newEntity = {
            employeeId: 1, firstName: 'John Doe',
            lastName: 'Doe', address: "23131 big street"
        }

        await database.addNewEntityAsync(newEntity, newEntity.employeeId);
        const foundEntity = await database.getEntityDataAsync(newEntity.employeeId);

        expect(foundEntity).to.deep.equal({ id: newEntity.employeeId, content: newEntity });
    });

    it('should throw an error when adding a duplicate entity', async () => {

        await database.deleteAll();

        const newEntity = {
            employeeId: 1, firstName: 'John Doe',
            lastName: 'Doe', address: "23131 big street"
        }
        await database.addNewEntityAsync(newEntity, newEntity.employeeId);

        try {
            await database.addNewEntityAsync(newEntity, newEntity.employeeId);
        } catch (error) {
            expect(error).to.be.instanceOf(ServerError);
        }
    });

    it('should retrieve a entity with matching id', async () => {
        await database.deleteAll();
        const newEntity = {
            employeeId: 1, firstName: 'John Doe',
            lastName: 'Doe', address: "23131 big street"
        }
        const newEntity2 = {
            employeeId: 2, firstName: 'John Doe',
            lastName: 'Doe', address: "23131 big street"
        }
        const newEntity3 = {
            employeeId: 3, firstName: 'John Doe',
            lastName: 'Doe', address: "23131 big street"
        }

        await database.addNewEntityAsync(newEntity, newEntity.employeeId);
        await database.addNewEntityAsync(newEntity2, newEntity2.employeeId);
        await database.addNewEntityAsync(newEntity3, newEntity3.employeeId);
        const foundEntity = await database.getEntityDataAsync(newEntity.employeeId);

        expect(foundEntity).to.deep.equal({ id: newEntity.employeeId, content: newEntity });
    });
});
