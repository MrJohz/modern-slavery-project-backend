exports.register = function Router(server, knex, next) {
    knex.client.on('start', builder => {
        builder.on('query', query => {
            server.log(['debug', 'sql'], query)
        });
    });

    next();
};

exports.register.attributes = {
    name: 'knex-logger',
    version: require('../../package.json').version
};
