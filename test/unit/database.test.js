import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import path from 'path';
import Database from '../../src/database.js'; // Adjust the path accordingly
import { ServerError } from '../../src/errors.js'; // Ensure to import ServerError

describe('Database Class', () => {
    let database;
    let jsonFilePresetStub;

    beforeEach(async () => {
        // Stub the JSONFilePreset and fs methods
        jsonFilePresetStub = sinon.stub().returns({
            data: { posts: [] },
            read: sinon.stub().resolves(),
            write: sinon.stub().resolves(),
        });

        // Replace the actual JSONFilePreset with the stub
        sinon.replace(Database.prototype, 'initialize', jsonFilePresetStub);

        database = new Database();
        await database.initialize();
    });

    afterEach(() => {
        // Restore original functionality
        sinon.restore();
    });

    describe('Initialization', () => {
        it('should initialize the database with an empty posts array if the database file does not exist', async () => {
            // Arrange
            sinon.stub(fs, 'existsSync').returns(false);

            // Act
            await database.initialize();

            // Assert
            expect(database._database.data.posts).to.deep.equal([]);
            expect(jsonFilePresetStub.calledOnce).to.be.true;
        });

        it('should read from the existing database file if it exists', async () => {
            // Arrange
            sinon.stub(fs, 'existsSync').returns(true);
            jsonFilePresetStub().data = { posts: [{ id: '1', content: 'First post' }] };

            // Act
            await database.initialize();

            // Assert
            expect(database._database.data.posts).to.deep.equal([{ id: '1', content: 'First post' }]);
        });
    });

    describe('addNewEntityAsync', () => {
        it('should add a new entity successfully', async () => {
            // Arrange
            const newEntity = { title: 'New Post' };
            const entityId = '1';

            // Act
            await database.addNewEntityAsync(newEntity, entityId);

            // Assert
            expect(database._database.data.posts).to.deep.equal([{ id: entityId, content: newEntity }]);
            expect(database._database.write.calledOnce).to.be.true;
        });

        it('should throw an error if trying to add an entity with a duplicate id', async () => {
            // Arrange
            const existingEntity = { title: 'Existing Post' };
            const entityId = '1';
            await database.addNewEntityAsync(existingEntity, entityId);

            const newEntity = { title: 'Another Post' };

            // Act & Assert
            await expect(database.addNewEntityAsync(newEntity, entityId)).to.be.rejectedWith(ServerError, "Database not configured to allow duplicate id's");
        });

        it('should throw an error if adding a new entity fails', async () => {
            // Arrange
            sinon.stub(database._database, 'write').throws(new Error('Write error'));
            const newEntity = { title: 'Failing Post' };
            const entityId = '2';

            // Act & Assert
            await expect(database.addNewEntityAsync(newEntity, entityId)).to.be.rejectedWith(ServerError, "Failed to add new entity");
        });
    });

    describe('getEntityDataAsync', () => {
        it('should return entity data if it exists', async () => {
            // Arrange
            const existingEntity = { title: 'Existing Post' };
            const entityId = '1';
            await database.addNewEntityAsync(existingEntity, entityId);

            // Act
            const result = await database.getEntityDataAsync(entityId);

            // Assert
            expect(result).to.deep.equal({ id: entityId, content: existingEntity });
        });

        it('should return null if the entity does not exist', async () => {
            // Act
            const result = await database.getEntityDataAsync('non-existing-id');

            // Assert
            expect(result).to.be.null;
        });
    });
});
