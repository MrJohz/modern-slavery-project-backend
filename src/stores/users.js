const { User } = require('../models/users');

module.exports.UserKnexStore = class UserKnexStore {
    constructor(knex) {
        this.knex = knex;
    }

    async getUserById(id) {
        const userWithGroups = await this.knex('users')
            .where({ id: id })
            .leftJoin('group_users', 'users.id', '=', 'group_users.user')
            .select('users.id', 'users.name', 'users.email', 'users.site_admin',
                'group_users.group', 'group_users.group_admin');

        if (!userWithGroups.length) {
            return null;  // cannot find user
        }

        const user = userWithGroups[0];
        user.memberOf = userWithGroups.filter(user => user.group != null).map(user => user.group);
        user.administrates = userWithGroups.filter(user => user.group_admin).map(user => user.group);

        return new User(user);
    }

    async getAllUsers() {
        const userQuery = await this.knex('users')
            .leftJoin('group_users', 'users.id', '=', 'group_users.user')
            .select('users.id', 'users.name', 'users.email', 'users.site_admin',
                'group_users.group', 'group_users.group_admin')
            .orderBy('users.id', 'asc');

        // the following aggregates users to collect which groups they're part of
        // it would be nice if this could be done in another way. maybe look at an ORM?
        const users = [];

        let currentId = null;  // assumes orderBy users.id!
        let aggregatedUser = null;
        for (const eachUser of userQuery) {
            if (eachUser.id !== currentId) {
                if (aggregatedUser != null) {  // first id is always null
                    users.push(new User(aggregatedUser));
                }

                currentId = eachUser.id;
                aggregatedUser = eachUser;
                aggregatedUser.memberOf = [];
                aggregatedUser.administrates = [];
            }

            if (eachUser.group != null) {
                aggregatedUser.memberOf.push(eachUser.group);
                if (eachUser.group_admin) {
                    aggregatedUser.administrates.push(eachUser.group);
                }
            }
        }

        if (aggregatedUser != null) {
            users.push(new User(aggregatedUser));  // last user won't have been added yet
        }

        return users;
    }
};
