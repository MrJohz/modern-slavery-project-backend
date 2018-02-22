module.exports.route = ({ resultStore }) => {

    const create = async (request, reply) => {
        console.log(request.payload);
        await resultStore.insertResult(request.payload);
        reply();
    };

    return { create };
};
