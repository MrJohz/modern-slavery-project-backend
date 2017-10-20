const { Group } = require('../models/groups');

module.exports.GroupKnexStore = class GroupKnexStore {
    constructor(knex) {
        this.knex = knex;
    }

    async getGroupById(id) {
        const group = await this.knex('groups')
            .where({ id })
            .first();

        if (!group) {
            return null;  // cannot find group
        }

        return new Group(group);
    }

    async getAllGroups() {
        return (await this.knex('groups'))
            .map(group => new Group(group));
    }
};
