exports.env = (process.env.NODE_ENV || 'development').toLowerCase();
exports.DEBUG = exports.env === 'development';

exports.security = {
    saltRounds: parseInt(process.env.SALT_ROUNDS, 10) || 10,
};
