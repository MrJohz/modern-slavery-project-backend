// Update with your config settings.

module.exports = {

    test: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: ':memory:',
        }
    },

    development: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: './dev.db',
        }
    },

};
