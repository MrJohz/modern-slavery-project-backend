const { required } = require('./utils');

module.exports.Group = class Group {
    constructor(group) {
        this.id = required(group, 'id');
        this.name = required(group, 'name');
        this.description = required(group, 'description');
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
        };
    }
};
