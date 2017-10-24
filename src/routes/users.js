const { EmailExistsError } = require("../stores/users");
const { badRequest, notFound } = require('boom');

module.exports.route = ({ userStore }) => {

    const fetchOne = async (request, reply) => {
        if (!/^\d+$/.test(request.params.id)) {
            return reply(badRequest(`could not coerce '${request.params.id}' to int`));
        }

        const user = await userStore.getUserById(parseInt(request.params.id, 10));

        return user
            ? reply(user)
            : reply(notFound(`could not find user with id ${request.params.id}`));
    };

    const fetchAll = async (request, reply) => {
        reply(await userStore.getAllUsers());
    };

    const create = async (request, reply) => {
        const validationErrors = [];

        if (!request.payload) {
            // if no payload is sent, payload is null
            // set it to an empty object instead - it makes for easier validation down the line
            request.payload = {};
        }

        for (const key of ['name', 'email', 'password']) {
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

        let user;
        try {
            user = await userStore.createUser(request.payload);
        } catch (e) {
            if (e instanceof EmailExistsError) {
                validationErrors.push(`email already in use`);
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

        return reply(user);
    };

    const remove = async (request, reply) => {
        if (!/^\d+$/.test(request.params.id)) {
            return reply(badRequest(`could not coerce '${request.params.id}' to int`));
        }

        const deleted = await userStore.deleteUserById(parseInt(request.params.id, 10));

        return deleted
            ? reply()  // empty
            : reply(notFound(`could not find user with id ${request.params.id}`));
    };

    return { fetchOne, fetchAll, create, remove };
};
