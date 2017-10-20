const { required } = require('./utils');

module.exports.User = class User {
    constructor(user) {
        this.id = required(user, 'id');
        this.name = required(user, 'name');
        this.email = required(user, 'email');
        this.site_admin = !!required(user, 'site_admin');  // cast to boolean, some stores won't do this by default
        this.administrates = required(user, 'administrates');
        this.memberOf = required(user, 'memberOf');
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            site_admin: this.site_admin,
            administrates: this.administrates,
            memberOf: this.memberOf,
        };
    }
};
