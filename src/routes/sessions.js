const { badRequest, notFound } = require('boom');

const { InvalidCredentialsError } = require("../stores/users");
const { SessionNotFound, RevalidationError, OutOfDateError } = require('../stores/sessions');

const UUID_REGEX = /^[\da-fA-F]{8}(-[\da-fA-F]{4}){3}-[\da-fA-F]{12}$/;

module.exports.route = ({ sessionStore }) => {

    const fetchOne = async (request, reply) => {
        if (!UUID_REGEX.test(request.params.id)) {
            return reply(badRequest(`could not coerce '${request.params.id}' to uuid`));
        }

        const user = await sessionStore.getSession(request.params.id);

        return user
            ? reply(user)
            : reply(notFound(`could not find session with id ${request.params.id}`));
    };

    const create = async (request, reply) => {
        const validationErrors = [];

        if (!request.payload) {
            // if no payload is sent, payload is null
            // set it to an empty object instead - it makes for easier validation down the line
            request.payload = {};
        }

        for (const key of ['email', 'password']) {
            if (!(key in request.payload)) {
                validationErrors.push(`key not found: ${key}`);
            }
        }

        if (validationErrors.length) {
            const err = badRequest(`invalid payload sent`, { validationErrors });
            err.reformat();  // boom is weird - https://github.com/hapijs/hapi/blob/master/API.md#error-transformation
            err.output.payload.validationErrors = validationErrors;
            return reply(err);
        }

        let session;
        try {
            session = await sessionStore.createSession(request.payload.email, "" + request.payload.password);
        } catch (e) {
            if (e instanceof InvalidCredentialsError) {
                validationErrors.push(`incorrect email or password submitted`);
            } else {
                throw e;
            }
        }

        if (validationErrors.length) {
            const err = badRequest(`invalid payload sent`, { validationErrors });
            err.reformat();  // boom is weird - https://github.com/hapijs/hapi/blob/master/API.md#error-transformation
            err.output.payload.validationErrors = validationErrors;
            return reply(err);
        }

        return reply(session);
    };

    const remove = async (request, reply) => {
        if (!UUID_REGEX.test(request.params.id)) {
            return reply(badRequest(`could not coerce '${request.params.id}' to uuid`));
        }

        const deleted = await sessionStore.removeSession(request.params.id);

        return deleted
            ? reply()  // empty
            : reply(notFound(`could not find session ${request.params.id}`));
    };

    const removeAll = async (request, reply) => {
        if (!/^\d+$/.test(request.query.user)) {
            return reply(badRequest(`could not coerce '${request.query.user}' to int`));
        }

        await sessionStore.removeAllSessions(parseInt(request.query.user, 10));
        return reply();
    };

    // refresh session - either use only session ID, or provide username/password as well
    const update = async (request, reply) => {
        if (!UUID_REGEX.test(request.params.id)) {
            return reply(badRequest(`could not coerce '${request.params.id}' to uuid`));
        }

        const validationErrors = [];

        let refresher;

        if (request.payload) {
            for (const key of ['email', 'password']) {
                if (!(key in request.payload)) {
                    validationErrors.push(`payload provided but key not found: ${key}`);
                }
            }

            if (validationErrors.length) {
                const err = badRequest(`invalid payload sent`, { validationErrors });
                err.reformat();  // boom is weird -
                                 // https://github.com/hapijs/hapi/blob/master/API.md#error-transformation
                err.output.payload.validationErrors = validationErrors;
                return reply(err);
            }

            refresher = (id) =>
                sessionStore.refreshSessionWithValidation(id, request.payload.email, request.payload.password);
        } else {
            refresher = (id) =>
                sessionStore.refreshSession(id);
        }

        let session;
        try {
            session = await refresher(request.params.id);
        } catch (e) {
            if (e instanceof InvalidCredentialsError
                || e instanceof SessionNotFound
                || e instanceof RevalidationError
                || e instanceof OutOfDateError) {
                validationErrors.push(e.message);
            } else {
                throw e;
            }
        }

        if (validationErrors.length) {
            const err = badRequest(`invalid payload sent`, { validationErrors });
            err.reformat();  // boom is weird - https://github.com/hapijs/hapi/blob/master/API.md#error-transformation
            err.output.payload.validationErrors = validationErrors;
            return reply(err);
        }

        return reply(session);

    };

    return { fetchOne, create, remove, removeAll, update };
};
