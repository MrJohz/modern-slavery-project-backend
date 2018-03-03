const { server } = require('./src/server');

server.register(require('inert'), err => {
    if (err) {
        console.error(err);
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/app/{param*}',
        handler: {
            directory: {
                path: '../frontend/dist',
                listing: true,
                index: true,
            }
        }
    })
});

server.start(err => {
    if (err) return console.error(err);

    console.log(`Server running at ${server.info.uri}`);
});
