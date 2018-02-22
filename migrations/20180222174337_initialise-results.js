
exports.up = async function(knex) {
    await knex.schema.createTable('results', table => {
        table.increments('id');
        table.json('response');
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTable('results');
};
