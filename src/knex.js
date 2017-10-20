const env = (process.env.NODE_ENV || 'development').toLowerCase();

module.exports.knex = require('knex')(require('../knexfile')[env]);
