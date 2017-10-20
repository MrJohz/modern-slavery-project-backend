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

    const update = (request, reply) => {
        reply([
            { id: 13, name: 'Kevin', email: 'kevin@kevin.kevin', systemAdmin: false },
            { id: 53, name: 'admin', email: 'admin@admin.admin', systemAdmin: true },
        ])
    };

    return { fetchOne, fetchAll, update };
};
