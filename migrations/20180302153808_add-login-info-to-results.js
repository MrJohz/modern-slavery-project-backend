exports.up = async function(knex) {
    await knex.schema.alterTable('results', table => {
        table.integer('user').nullable().references('id').inTable('users');
        table.integer('language').nullable().references('id').inTable('languages')
    });
};

exports.down = async function(knex) {
    await knex.schema.alterTable('results', table => {
        table.dropColumns('user', 'language');
    });
};
