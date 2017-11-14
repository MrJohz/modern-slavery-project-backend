exports.up = async function (knex) {
    await knex.schema.createTable('users', table => {
        table.increments('id');
        table.string('name');
        table.string('email').unique();
        table.string('password');
        table.boolean('site_admin');
    });

    await knex.schema.createTable('groups', table => {
        table.increments('id');
        table.string('name');
        table.text('description');
    });

    await knex.schema.createTable('group_users', table => {
        table.integer('user').references('id').inTable('users');
        table.integer('group').references('group').inTable('groups');
        table.boolean('group_admin');

        table.primary('user', 'group');
    })
};

exports.down = async function (knex) {
    await knex.schema.dropTable('users');
    await knex.schema.dropTable('groups');
    await knex.schema.dropTable('group_users');
};
