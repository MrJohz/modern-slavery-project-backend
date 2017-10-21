const { required } = require('./utils');

module.exports.Group = class Group {
    constructor(group) {
        this.id = required(group, 'id');
        this.name = required(group, 'name');
        this.description = required(group, 'description');
        this.users = required(group, 'users');
        this.admins = required(group, 'admins');
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            users: this.users,
            admins: this.admins,
        };
    }
};
