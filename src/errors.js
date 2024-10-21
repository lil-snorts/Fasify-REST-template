class ClientError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class ServerError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

export { ServerError, ClientError };