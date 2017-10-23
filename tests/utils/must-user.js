const { User } = require("../../src/models/users");

module.exports = function plugin(Must) {
    Must.prototype.User = function isUser(expected) {
        this.eql(new User(expected));
    };

    Must.prototype.Users = function isListOfUsers(...expected) {
        this.eql(expected.map(user => new User(user)));
    };
};
