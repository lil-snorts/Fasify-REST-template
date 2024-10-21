// server.js
import Fastify from 'fastify';
import CustomerDatabaseUtil from './customerDatabaseUtil.js';
import { postCustomerSchema, getCustomerIdSchema } from './schemas.js';
import { ClientError } from './errors.js';

export class FastifyServer {
	constructor() {
		this.fastifyServer = Fastify({ logger: true });
		this.customerDatabaseUtil = new CustomerDatabaseUtil();
		this.createRestRoutes();
		this.setServerErrorHandler();
	}

	createRestRoutes() {
		// GET customer by id
		this.fastifyServer.get('/customers/:id', { schema: getCustomerIdSchema }, async (request, reply) => {
			return await this.customerDatabaseUtil.getCustomerAsync(request.params.id);
		});

		// POST new customer
		this.fastifyServer.post('/customers', { schema: postCustomerSchema }, async (request, reply) => {
			await this.customerDatabaseUtil.addNewCustomerAsync(request.body);
			return reply.status(201).send({ message: 'Created successfully' });
		});
	}

	setServerErrorHandler() {
		this.fastifyServer.setErrorHandler((error, request, reply) => {
			this.fastifyServer.log.debug(`error: ${error}`);
			if (error.validation) {
				const response = {
					fault: {
						code: 'badRequest',
						httpStatus: 400,
						message: 'You have supplied invalid request details',
						serverDateTime: new Date().toISOString(),
						failures: error.validation.map(err => ({
							field: err.instancePath.replace('/', ''),
							message: err.message
						}))
					}
				};
				return reply.status(400).send(response);
			} else if (error instanceof ClientError) {
				const response = {
					fault: {
						code: 'badRequest',
						httpStatus: 400,
						message: 'You have supplied invalid request details',
						serverDateTime: new Date().toISOString(),
						failures: [error.message]
					}
				};
				return reply.status(400).send(response);
			}
			// All other errors
			const response = {
				fault: {
					code: 'internalError',
					httpStatus: 500,
					message: 'An internal error was encountered processing the request',
					serverDateTime: new Date().toISOString(),
					failures: [error.message]
				}
			};
			this.fastifyServer.log.info(error.message);
			return reply.status(500).send(response);
		});
	}

	async start(port = 3000) {
		try {
			await this.fastifyServer.listen({ port });
			this.fastifyServer.log.info(`Server is running at http://localhost:${port}`);
		} catch (err) {
			this.fastifyServer.log.error(err);
			process.exit(1);
		}
	}

	getInstance() {
		return this.fastifyServer;
	}
}

// Export a function to create and start the server
export const buildAndStartServer = async () => {
	const server = new FastifyServer();
	await server.start();
	return server.getInstance();
};

// For unit testing, you can create an instance of FastifyServer without starting it
export const createServerInstance = () => {
	return new FastifyServer().getInstance();
};
