const hapi = require('hapi');

const { DEBUG } = require('./environment');
const { create } = require('./knex');
const { UserKnexStore } = require('./stores/users');
const { GroupKnexStore } = require('./stores/groups');
const { ProcedureStore } = require('./stores/procedures');
const { LanguageStore } = require('./stores/languages');
const { ResultStore } = require('./stores/results');
const { SessionStore } = require('./stores/sessions');

const knex = create();

const server = new hapi.Server();
server.connection({
    port: 3000,
    host: 'localhost',
    routes: {
        cors: true,
        json: DEBUG ? { space: 4 } : null,
    }
});

server.register({
    register: require('hapi-cors'),
    options: {
        origins: ['*'],
        headers: ['Accept', 'Content-Type', 'Authorization', 'Session'],
    }
}, err => {
    if (!err) return;

    console.error('Failed to load cors:', err);
    throw err;
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

if (DEBUG) {
    server.register({
        register: require('./plugins/knex-logger'),
        options: knex
    }, err => {
        if (!err) return;

        console.error('Failed to load knex logger:', err);
        throw err;
    });
}

server.register({
    register: require('./plugins/routing'),
    options: {
        context: {
            userStore: new UserKnexStore(knex),
            groupStore: new GroupKnexStore(knex),
            procedureStore: new ProcedureStore(knex),
            languageStore: new LanguageStore(knex),
            resultStore: new ResultStore(knex),
            sessionStore: new SessionStore(knex),
        },
        routes: [
            { mount: '/users', use: require('./routes/users') },
            { mount: '/groups', use: require('./routes/groups') },
            { mount: '/procedures', use: require('./routes/procedures') },
            { mount: '/languages', use: require('./routes/languages') },
            { mount: '/results', use: require('./routes/results') },
            { mount: '/sessions', use: require('./routes/sessions') },
        ]
    }
}, err => {
    if (!err) return;

    console.error('Failed to load routes:', err);
    throw err;
});

module.exports.server = server;
