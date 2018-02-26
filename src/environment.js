const { hash } = require('bcrypt');

exports.env = (process.env.NODE_ENV || 'development').toLowerCase();
exports.DEBUG = exports.env === 'development';

exports.security = {
    saltRounds: parseInt(process.env.SALT_ROUNDS, 10) || 10,
};

exports.utilities = {
    async hash(password) {
        return await hash(password, exports.security.saltRounds);
    }
};
