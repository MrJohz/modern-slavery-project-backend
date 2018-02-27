const { hash } = require('bcrypt');

exports.env = (process.env.NODE_ENV || process.env.MDS_ENV || 'development').toLowerCase();
exports.DEBUG = exports.env === 'development';

exports.security = {
    saltRounds: parseInt(process.env.MDS_SALT_ROUNDS, 10) || 10,
    sessionTimeout: parseInt(process.env.MDS_SESSION_TIMEOUT, 10) || 8,
};

exports.utilities = {
    async hash(password) {
        return await hash(password, exports.security.saltRounds);
    }
};
