const hapi = require('hapi');

const { DEBUG } = require('./environment');
const { knex } = require('./knex');
const { UserKnexStore } = require('./stores/users');
const { GroupKnexStore } = require('./stores/groups');

const server = new hapi.Server();
server.connection({
    port: 3000,
    host: 'localhost',
    routes: {
        json: DEBUG ? { space: 4 } : null
    }
});

server.register({
    register: require('good'),
    options: {
        reporters: {
            console: [
                {
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{ response: '*', log: '*', error: '*' }],
                },
                { module: 'good-console' },
                'stdout',
            ]
        }
    }
}, err => {
    if (!err) return;

    console.error('Failed to load logging:', err);
    throw err;
});

server.register({
    register: require('./plugins/routing'),
    options: {
        context: {
            userStore: new UserKnexStore(knex),
            groupStore: new GroupKnexStore(knex),
        },
        routes: [
            { mount: '/users', use: require('./routes/users') },
            { mount: '/groups', use: require('./routes/groups') }
        ]
    }
}, err => {
    if (!err) return;

    console.error('Failed to load routes:', err);
    throw err;
});

module.exports.server = server;
