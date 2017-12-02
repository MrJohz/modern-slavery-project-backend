module.exports.route = ({ languageStore }) => {

    const fetchAll = async (request, reply) => {
        reply(await languageStore.getAllLanguages());
    };

    return { fetchAll };
};
