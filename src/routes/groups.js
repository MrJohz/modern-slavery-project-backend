const { badRequest, notFound } = require('boom');

module.exports.route = ({ groupStore }) => {

    const fetchOne = async (request, reply) => {
        if (!/^\d+$/.test(request.params.id)) {
            return reply(badRequest(`could not coerce '${request.params.id}' to int`));
        }

        const group = await groupStore.getGroupById(parseInt(request.params.id, 10));

        return group
            ? reply(group)
            : reply(notFound(`could not find group with id ${request.params.id}`));
    };

    const fetchAll = async (request, reply) => {
        reply(await groupStore.getAllGroups());
    };

    return { fetchOne, fetchAll };
};
