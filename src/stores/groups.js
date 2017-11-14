const { ExtendableError } = require("../models/errors");
const { Group } = require('../models/groups');
const { required } = require('../models/utils');

exports.GroupNotFound = class GroupNotFoundError extends ExtendableError {};
exports.UserNotFound = class UserNotFoundError extends ExtendableError {};
exports.UserAlreadyAdded = class UserAlreadyAddedError extends ExtendableError {};
exports.UserNotInGroup = class UserNotInGroupError extends ExtendableError {};

exports.GroupKnexStore = class GroupKnexStore {
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

    async getGroupById(groupId, _trx) {
        const groupWithUsers = await this._getTableWithTransaction('groups', _trx)
            .where({ id: groupId })
            .leftJoin('group_users', 'groups.id', '=', 'group_users.group')
            .select('groups.id', 'groups.name', 'groups.description',
                'group_users.user', 'group_users.group_admin');

        if (!groupWithUsers.length) {
            return null;  // cannot find group
        }

        const group = groupWithUsers[0];
        group.users = groupWithUsers.filter(group => group.user != null).map(group => group.user);
        group.admins = groupWithUsers.filter(group => group.group_admin).map(group => group.user);

        return new Group(group);
    }

    async getAllGroups(_trx) {
        const groupsWithUsers = await this._getTableWithTransaction('groups', _trx)
            .leftJoin('group_users', 'groups.id', '=', 'group_users.group')
            .select('groups.id', 'groups.name', 'groups.description',
                'group_users.user', 'group_users.group_admin')
            .orderBy('groups.id', 'asc');

        const groups = [];

        let currentId = null;
        let aggregatedGroup = null;
        for (const group of groupsWithUsers) {
            if (group.id !== currentId) {
                if (currentId !== null) {
                    groups.push(new Group(aggregatedGroup));
                }

                currentId = group.id;
                aggregatedGroup = group;
                aggregatedGroup.users = [];
                aggregatedGroup.admins = [];
            }

            if (group.user != null) {
                aggregatedGroup.users.push(group.user);
                if (group.group_admin) {
                    aggregatedGroup.admins.push(group.user);
                }
            }
        }

        if (aggregatedGroup != null) {
            groups.push(new Group(aggregatedGroup));
        }

        return groups;
    }

    async addUserToGroup(options, _trx) {
        // This method is painfully slow.  It can *probably* be fixed by losing some of the error checking,
        // or by EAFP-programming and checking what the error might be after it's occurred, but both of those
        // are far too much effort for right now, so I'm marking this down as a lost cause.  Add it to the tech debt!

        const userId = required(options, 'user');
        const groupId = required(options, 'group');
        const addAsAdmin = !!(options && options.isAdmin);

        const operation = async trx => {
            const [userCount, groupCount] = await this._knex('users')
                .transacting(trx)
                .count('id as count')
                .where('id', userId)
                .unionAll(query =>
                    query.count('id as count')
                        .from('groups')
                        .where('id', groupId));

            if (groupCount.count === 0) {
                throw new exports.GroupNotFound(`no group with id ${groupId}`);
            }

            if (userCount.count === 0) {
                throw new exports.UserNotFound(`no user with id ${userId}`);
            }

            const existingLink = await this._knex('group_users')
                .transacting(trx)
                .where({ user: userId, group: groupId })
                .count('id as count')
                .first();

            if (existingLink.count > 0) {
                throw new exports.UserAlreadyAdded(`user with id ${userId} already in group ${groupId}`);
            }

            await this._knex('group_users')
                .transacting(trx)
                .insert({ user: userId, group: groupId, group_admin: addAsAdmin });
        };

        if (_trx) {  // are we part of an existing transaction?  if so let's not open a new one
            return await operation(_trx);
        } else {  // no we're not, well we need one anyway
            return await this._knex.transaction(operation)
        }
    }

    async setUserAdmin(options, _trx) {
        const userId = required(options, 'user');
        const groupId = required(options, 'group');
        const setAdmin = required(options, 'isAdmin');

        const operation = async trx => {
            const [userCount, groupCount] = await this._knex('users')
                .transacting(trx)
                .count('* as count')
                .where('id', userId)
                .unionAll(query =>
                    query.count('* as count')
                        .from('groups')
                        .where('id', groupId));

            if (groupCount.count === 0) {
                throw new exports.GroupNotFound(`no group with id ${groupId}`);
            }

            if (userCount.count === 0) {
                throw new exports.UserNotFound(`no user with id ${userId}`);
            }

            const existingLink = await this._knex('group_users')
                .transacting(trx)
                .where({ user: userId, group: groupId })
                .update({ group_admin: setAdmin });

            if (!existingLink) {
                throw new exports.UserNotInGroup(`user with id ${userId} not in group ${groupId}`);
            }
        };

        if (_trx) {  // are we part of an existing transaction?  if so let's not open a new one
            return await operation(_trx);
        } else {  // no we're not, well we need one anyway
            return await this._knex.transaction(operation)
        }

    }

    async createGroup(group, _trx) {
        const groupToCreate = {
            name: required(group, 'name'),
            description: required(group, 'description'),
        };

        let initialUser = required(group, 'adminUser');

        const operation = async trx => {
            const groupId = await this._knex('groups')
                .transacting(trx)
                .insert(groupToCreate);

            await this.addUserToGroup({ user: initialUser, group: groupId, admin: true }, trx);

            return new Group(Object.assign(groupToCreate, {
                users: [initialUser],
                admins: [initialUser],
            }));
        };

        if (_trx) {  // are we part of an existing transaction?  if so let's not open a new one
            return await operation(_trx);
        } else {  // no we're not, well we need one anyway
            return await this._knex.transaction(operation)
        }
    }
};
