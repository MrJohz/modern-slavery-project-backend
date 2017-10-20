const { server } = require('./src/server');

server.start(err => {
    if (err) console.error(err);

    console.log(`Server running at ${server.info.uri}`);
});
