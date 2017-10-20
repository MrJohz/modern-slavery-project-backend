module.exports.UserKnexStore = class UserKnexStore {
    constructor(knex) {
        this.knex = knex;
    }

    async getUserById(id) {
        const user = await this.knex('users')
            .where({ id })
            .select('id', 'name', 'email', 'site_admin')
            .first();

        user.site_admin = !!user.site_admin;  // cast to boolean, sqlite by default doesn't
        return user;
    }

    async getAllUsers() {
        const users = await this.knex('users')
            .select('id', 'name', 'email', 'site_admin');

        for (const user of users) {
            user.site_admin = !!user.site_admin;
        }

        return users;
    }
};
