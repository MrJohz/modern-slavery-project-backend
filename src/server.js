const hapi = require('hapi');

const { DEBUG } = require('./environment');
const { knex } = require('./knex');
const { UserKnexStore } = require('./stores/users');

const server = new hapi.Server();
server.connection({
    port: 3000,
    host: 'localhost',
    routes: {
        json: DEBUG ? { space: 4 } : null
    }
});

server.register({
    register: require('./plugins/routing'),
    options: {
        context: {
            userStore: new UserKnexStore(knex)
        },
        routes: [
            { mount: '/users', use: require('./routes/users') },
        ]
    }
}, err => {
    if (err) console.error('Failed to load routes:', err);
});

module.exports.server = server;
