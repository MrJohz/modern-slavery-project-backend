const { required } = require('./utils');

module.exports.User = class User {
    constructor(user) {
        this.id = required(user, 'id');
        this.name = required(user, 'name');
        this.email = required(user, 'email');
        this._site_admin = !!required(user, 'site_admin');  // cast to boolean, some stores won't do this by default
        this._password = user.password;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            site_admin: this._site_admin
        };
    }
};
