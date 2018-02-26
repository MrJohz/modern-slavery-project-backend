exports.up = async function(knex) {
    await knex.schema.createTable('sessions', table => {
        table.uuid('id').notNullable().primary();
        table.integer('user').notNullable().references('id').inTable('users');
        table.dateTime('expires_at').notNullable();
        table.boolean('needs_revalidation').notNullable();
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTable('sessions');
};
