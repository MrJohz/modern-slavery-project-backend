const { badRequest } = require('boom');

module.exports.route = ({ procedureStore }) => {

    const fetchOne = async (request, reply) => {
        if (!/^\d+$/.test(request.params.id)) {
            return reply(badRequest(`could not coerce '${request.params.id}' to int`));
        }

        const id = parseInt(request.params.id, 10);
        const language = parseInt(request.query.language, 10);

        reply(await procedureStore.getProcedureById(id, language));
    };

    return { fetchOne };
};
