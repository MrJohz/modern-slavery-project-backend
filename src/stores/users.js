const { ExtendableError } = require("../models/errors");
const { User } = require('../models/users');
const { required } = require('../models/utils');
const { hash } = require('bcrypt');

const { security } = require('../environment');

exports.UserExistsError = class UserExistsError extends ExtendableError {};
exports.UserNotFoundError = class UserNotFoundError extends ExtendableError {};

exports.UserKnexStore = class UserKnexStore {
    constructor(knex) {
        this._knex = knex;
    }

    _getTableWithTransaction(tableName, maybeTrx) {
        const table = this._knex(tableName);
        if (maybeTrx) {
            table.transacting(maybeTrx);
        }

        return table;
    }

    async getUserById(userId, _trx) {
        const userWithGroups = await this._getTableWithTransaction('users', _trx)
            .where({ id: userId })
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

    async getAllUsers(_trx) {
        const userQuery = await this._getTableWithTransaction('users', _trx)
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

    async createUser(user, _trx) {
        const userToInsert = {
            name: required(user, 'name'),
            email: required(user, 'email'),
            password: await hash(required(user, 'password'), security.saltRounds),
            site_admin: false,
        };

        const operation = async trx => {
            const existingUsers = await this._knex('users')
                .transacting(trx)
                .where('email', userToInsert.email)
                .count('* as count')
                .first();

            if (existingUsers.count > 0) {
                throw new exports.UserExistsError(`email already in use`);
            }

            const id = await this._knex('users')
                .transacting(trx)
                .insert(userToInsert);

            return new User(Object.assign(userToInsert, {
                id: id[0], memberOf: [], administrates: [],
            }));
        };

        if (_trx) {  // are we part of an existing transaction?  if so let's not open a new one
            return await operation(_trx);
        } else {  // no we're not, well we need one anyway
            return await this._knex.transaction(operation)
        }
    }

    async deleteUserById(userId, _trx) {
        const rows = await this._getTableWithTransaction('users', _trx)
            .where('id', userId)
            .delete();

        return rows > 0;  // return true if a user was actually deleted
    }

    async updateUserById(userId, updater, _trx) {
        // TODO: huh, this is harder than I thought it would be - let's sleep on it!

        const operation = async trx => {
            const originalUser = await this.getUserById(userId, trx);

            // updater doesn't have to be async to work here, but it helps
            // so await it anyway.  we're in an async function, it's
            // basically free to do that (not a technically true statement)
            const newUser = await updater(originalUser);

            await this._knex('users')
                .transacting(trx)
                .where('id', userId)
                .update(/* but how? */)
        };

        if (_trx) {  // are we part of an existing transaction?  if so let's not open a new one
            return await operation(_trx);
        } else {  // no we're not, well we need one anyway
            return await this._knex.transaction(operation)
        }
    }

};
