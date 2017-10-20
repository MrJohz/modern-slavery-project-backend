const { User } = require('../models/users');

module.exports.UserKnexStore = class UserKnexStore {
    constructor(knex) {
        this.knex = knex;
    }

    async getUserById(id) {
        const user = await this.knex('users')
            .where({ id })
            .first();

        return new User(user);
    }

    async getAllUsers() {
        return (await this.knex('users'))
            .map(user => new User(user));
    }
};
