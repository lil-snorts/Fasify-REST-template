import Fastify from 'fastify';
import CustomerDatabaseUtil from './customerDatabaseUtil.js';
import { postCustomerSchema, getCustomerIdSchema } from './schemas.js';
import { ClientError } from './errors.js';

const fastifyServer = Fastify({ logger: true })

createRestRoutes();

setServerErrorHandler();

export const build = () => fastifyServer
const customerDatabaseUtil = new CustomerDatabaseUtil()

const startServer = async () => {
	try {
		await fastifyServer.listen({ port: 3000 })
		fastifyServer.log.info(`Server is running at http://localhost:3000`)
	} catch (err) {
		fastifyServer.log.error(err)
		process.exit(1)
	}
}

await startServer()

function setServerErrorHandler() {
	fastifyServer.setErrorHandler((error, request, reply) => {
		fastifyServer.log.debug(`error: ${error}`);
		if (error.validation) {
			const response = {
				fault: {
					code: 'badRequest',
					httpStatus: 400,
					message: 'You have supplied invalid request details',
					serverDateTime: new Date().toISOString(),
					failures: error.validation.map(err => {
						return {
							field: err.instancePath.replace('/', ''),
							message: err.message
						};
					})
				}
			};
			return reply
				.status(400)
				.send(response);
		} else if (error instanceof ClientError) {
			const response = {
				fault: {
					code: 'badRequest',
					httpStatus: 400,
					message: 'You have supplied invalid request details',
					serverDateTime: new Date().toISOString(),
					failures: [
						error.message
					]
				}
			};
			return reply
				.status(400)
				.send(response);
		}
		// All other errors
		const response = {
			fault: {
				code: 'internalError',
				httpStatus: 500,
				message: 'An internal error was encountered processing the request',
				serverDateTime: new Date().toISOString(),
				failures: [
					error.message
				]
			}
		};
		fastifyServer.log.info(error.message);

		return reply
			.status(500)
			.send(response);
	});
}

function createRestRoutes() {
	// GET customer by id
	fastifyServer.get('/customers/:id', { schema: getCustomerIdSchema }, async (request, reply) => {
		return await customerDatabaseUtil.getCustomerAsync(request.params.id);
	});

	// POST new customer
	fastifyServer.post('/customers', { schema: postCustomerSchema }, async (request, reply) => {
		await customerDatabaseUtil.addNewCustomerAsync(request.body);

		return reply
			.status(201)
			.send({ message: 'Created successfully' });
	});
}