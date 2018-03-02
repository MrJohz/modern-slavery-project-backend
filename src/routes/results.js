module.exports.route = ({ sessionStore, resultStore }) => {

    const create = async (request, reply) => {
        const sessionToken = request.headers['session'];
        // replace 'false' result with 'null'
        const session = await sessionStore.validateSession(sessionToken) || null;
        const userId = session && session.user && session.user.id;

        const { language, results } = request.payload;

        await resultStore.insertResult(userId, language, results);
        reply();
    };

    return { create };
};
