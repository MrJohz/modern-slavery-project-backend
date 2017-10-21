const { env } = require('./environment');

module.exports.create = (forceEnv) =>
    require('knex')(require('../knexfile')[forceEnv || env]);
