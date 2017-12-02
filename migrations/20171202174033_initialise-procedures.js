exports.up = async function (knex) {
    await knex.schema.createTable('languages', table => {
        table.increments('id');
        table.string('english_name');
        table.string('name');
        table.string('welcome');
        table.string('flags');  // comma separated values
    });

    await knex.schema.createTable('procedures', table => {
        table.increments('id');
        table.integer('start').references('id').inTable('steps');
        table.string('name');
    });

    // use a 'step kind' to differentiate between 'questions' and 'advices'.
    await knex.schema.createTable('step_kinds', table => {
        table.increments('id');
        table.string('name');
    });

    await knex('step_kinds').insert({ id: 0, name: 'question' });
    await knex('step_kinds').insert({ id: 1, name: 'advice' });

    await knex.schema.createTable('steps', table => {
        table.integer('id');
        table.integer('kind').references('id').inTable('step_kinds');

        // id needs to be unique for each step
        // add additional 'unique' constraint because we use (id, kind) as an FK
        // this isn't strictly necessary, but if for some reason the first constraint
        // gets removed, the second is still there.
        table.unique('id');
        table.unique(['id', 'kind']);
    });

    await knex.schema.createTable('questions', table => {
        table.integer('id').unique();
        table.integer('kind');
        table.foreign(['id', 'kind']).references(['id', 'kind']).inTable('steps');

        table.string('english_text');
        table.integer('procedure').references('id').inTable('procedures');
    });

    await knex.schema.createTable('question_texts', table => {
        table.increments('id');
        table.string('text');
        table.integer('language').references('id').inTable('languages');
        table.integer('question').references('id').inTable('questions');
        table.unique(['language', 'question']);
    });

    await knex.schema.createTable('answers', table => {
        table.increments('id');
        table.string('english_text');

        table.integer('answer_to').references('id').inTable('questions');
        table.integer('next_step').references('id').inTable('steps');
    });

    await knex.schema.createTable('answer_texts', table => {
        table.increments('id');
        table.string('text');
        table.integer('language').references('id').inTable('languages');
        table.integer('answer').references('id').inTable('answers');
        table.unique(['language', 'answer']);
    });

    await knex.schema.createTable('advices', table => {
        table.increments('id');
        table.integer('kind');
        table.foreign(['id', 'kind']).references(['id', 'kind']).inTable('steps');

        table.string('english_text');
        table.string('facilitator_advice');
        table.integer('procedure').references('id').inTable('procedures');
    });

    await knex.schema.createTable('advice_texts', table => {
        table.increments('id');
        table.string('text');
        table.integer('language').references('id').inTable('languages');
        table.integer('advice').references('id').inTable('advices');
        table.unique(['language', 'advice']);
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTable('advice_texts');
    await knex.schema.dropTable('advices');
    await knex.schema.dropTable('answer_texts');
    await knex.schema.dropTable('answers');
    await knex.schema.dropTable('question_texts');
    await knex.schema.dropTable('questions');
    await knex.schema.dropTable('steps');
    await knex.schema.dropTable('step_kinds');
    await knex.schema.dropTable('procedures');
    await knex.schema.dropTable('languages');
};
