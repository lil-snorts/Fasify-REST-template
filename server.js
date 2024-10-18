// Import Fastify
import Fastify from 'fastify';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node'
import fs from 'fs';
import path from 'path';
import { type } from 'os';

const fastify = Fastify({ logger: true })

const title = "This is a test"
const adapter = new JSONFileSync('file.json')
const db = new LowSync(adapter, {})

db.read()	//Load the content of the file into memory

// Check if the file exists and if db.data is undefined
if (!fs.existsSync(path.resolve('file.json')) || db.data === null) {
	// Initialize with default structure if the file does not exist or is empty
	db.data = { posts: [] };
	db.write(); // Write the initialized data to the file
}
db.data.posts.push({ title });  //add data into the "collection"

db.write() //persist the data by saving it to the JSON file

//any Find-like operation is left to the skill of the user

let record = db.data.posts.find(p => p.title == "Hello world")

if (!record) {
	console.log("No data found!")
} else {
	console.log("== Record found ==")
	console.log(record)
}

// GET: Retrieve a single book by ID
fastify.get('/books/:id', async (request, reply) => {
	// TODO make all the constant Strings CONSTS
	const customer = db.data.get("customers").find({ "employeeId": request.params.id })

	// TODO if customer not found, 400 instead of 404 because that's what the client wants

	if (!customer) {
		return reply.status(400).send({ message: 'L BOZO' })
	}
	return customer
})


const customerSchema = {
	schema: {
		body: {
			type: 'object',
			properties: {
				firstName: { type: 'string' },
				lastName: { type: 'string' },
				address: { type: 'string' },
				employeeId: { type: 'number' },
			}
		}
	}
}

// PUT: Update a book by ID
fastify.put('/customers', customerSchema, async (request, reply) => {
	const id = Number(request.body.employeeId)
	const index = books.findIndex(b => b.id === id)

	if (index === -1) {
		return reply.status(404).send({ message: 'Book not found' })
	}

	books[index] = {
		id,
		title: request.body.title,
		author: request.body.author
	}

	return books[index]
})

// Start the server
const start = async () => {
	try {
		await fastify.listen({ port: 3000 })
		fastify.log.info(`Server is running at http://localhost:3000`)
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

start()
