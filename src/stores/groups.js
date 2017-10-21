const { Group } = require('../models/groups');

module.exports.GroupKnexStore = class GroupKnexStore {
    constructor(knex) {
        this.knex = knex;
    }

    async getGroupById(groupId) {
        const groupWithUsers = await this.knex('groups')
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

    async getAllGroups() {
        const groupsWithUsers = await this.knex('groups')
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
};
