exports.env = (process.env.NODE_ENV || 'development').toLowerCase();

exports.DEBUG = exports.env === 'development';
