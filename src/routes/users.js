module.exports.route = ({ userStore }) => {

    const fetchOne = async (request, reply) => {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply(new Error('ahjkahdjkasdjkha'));
        }

        reply(await userStore.getUserById(id));
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
