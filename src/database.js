// database.js
import { JSONFilePreset } from 'lowdb/node'
import fileService from 'fs';
import path from 'path';
import { ServerError } from './errors.js';
const DATABASE_FILE = 'data.json';


class Database {
    constructor(databaseFile = DATABASE_FILE) {
        this.databaseFile = databaseFile;
        this.initialize()
    }

    async initialize() {
        this._database = await JSONFilePreset(this.databaseFile, {})

        await this._database.read()

        if (!fileService.existsSync(path.resolve(this.databaseFile)) || this._database.data === null) {
            this._database.data = { posts: [] };
            await this._database.write();
            console.log(`Database ${this.databaseFile} initialised`)
        }
    }

    async deleteAll() {
        this._database.data.posts = this._database.data.posts.filter((e) => e != e)
        await this._database.write();
    }

    async addNewEntityAsync(dataTransferObject, entityId) {
        if (this._database.data.posts.find((entity) => entity.id == entityId)) {
            console.debug("Duplicate Id found")
            throw new ServerError("Database not configured to allow duplicate id's")
        }

        try {
            await this._database.data
                .posts
                .push({ id: entityId, content: dataTransferObject })
            await this._database.write()
        } catch (error) {
            console.debug(error)
            throw new ServerError("Failed to add new entity")
        }
    }

    // Returns null if the customer is not found
    async getEntityDataAsync(searchForThisId) {
        return this._database.data
            .posts
            .find((entity) => entity.id == searchForThisId)
    }
}
export default Database