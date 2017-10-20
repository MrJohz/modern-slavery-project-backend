const { env } = require('./environment');

module.exports.knex = require('knex')(require('../knexfile')[env]);
