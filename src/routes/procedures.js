const { badRequest } = require('boom');

module.exports.route = ({ procedureStore }) => {

    const fetchOne = async (request, reply) => {
        if (!/^\d+$/.test(request.params.id)) {
            return reply(badRequest(`could not coerce '${request.params.id}' to int`));
        }

        reply(await procedureStore.getProcedureById(request.params.id));
    };

    return { fetchOne };
};
