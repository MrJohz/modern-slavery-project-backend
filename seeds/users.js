const { utilities } = require('../src/environment');

const USERS = [
    {
        id: 1,
        name: 'admin',
        email: 'test@test.com',
        password: 'admin',
        site_admin: true
    },
    {
        id: 2,
        name: 'test-user-seed',  // used to prove that these are seeded values, not real values
        email: 'test3@test.com',
        password: 'fb8e16a454dfce1e8824550e7022d37de2e634f7624b8383f4a39ec75df7249b',
        site_admin: false
    },
    {
        id: 3,
        name: 'xXx_RAWSTEEL_xXx',
        email: 'asmalcombe0@ask.com',
        password: 'i-am-the-best',
        site_admin: false
    },
    {
        id: 4,
        name: 'Jonas',
        email: 'jburde1@examiner.com',
        password: 'Brothers',
        site_admin: false
    },
    {
        id: 5,
        name: 'Yusinda Force',
        email: 'xforce2@boston.com',
        password: 'yo da man13$$',
        site_admin: false
    },
    {
        id: 6,
        name: 'Kristøs Bâudinet',
        email: 'kbaudinet3@is.gd',
        password: `already this is a fairly long password string, but then I'll repeat it a few million times just to be irritating`.repeat(1e6),
        site_admin: false
    },
    {
        id: 7,
        name: 'Nata Penny',
        email: 'nsamworth4@mac.com',
        password: 'stingy',
        site_admin: false
    },
    {
        id: 8,
        name: '孫德明',
        email: 'erufwa@mac.com',
        password: '获取该Unicode，杀死该Unicode',
        site_admin: false
    },
    {
        id: 9,
        name: 'Lucy Loner',
        email: 'lucl@ukas.com',
        password: '     ',
        site_admin: false
    },
];

exports.seed = async function (knex) {

    if ((await knex('users').count('* as count').first()).count > 0) {
        if ((await knex('users').where({ name: 'test-user-seed' }).count('* as count').first()).count === 0) {
            throw new Error('Cannot seed table, has already got non-seed data in it');
        }
    }

    await knex('users').delete();
    await knex('groups').delete();
    await knex('group_users').delete();

    for (const user of USERS) {
        user.password = await utilities.hash(user.password);
        await knex('users').insert(user);
    }

    const northEastHospital = (await knex('groups').insert({
        id: 1,
        name: 'North East Hospital',
        description: 'For hospital staff at the NEH',
    }))[0];  // the awkward [0] syntax is because by default `insert` returns an array, even if the input is not an
             // array

    const gmpFrontline = (await knex('groups').insert({
        id: 2,
        name: 'GMP Frontline',
        description: 'Frontline officers for Greater Manchester Police',
    }))[0];

    await knex('groups').insert({
        id: 3,
        name: 'Charities MDS Coalition',
        description: 'Consortium of users from charities',
    });

    await knex('group_users').insert([
        {
            user: knex('users').where({ name: 'Jonas' }).select('id').first(),
            group: northEastHospital,
            group_admin: true,
        },
        {
            user: knex('users').where({ name: 'Kristøs Bâudinet' }).select('id').first(),
            group: northEastHospital,
            group_admin: true,
        },
        {
            user: knex('users').where({ name: '孫德明' }).select('id').first(),
            group: northEastHospital,
            group_admin: false,
        },
        {
            user: knex('users').where({ name: 'Nata Penny' }).select('id').first(),
            group: northEastHospital,
            group_admin: false,
        },
        {
            user: knex('users').where({ name: 'Yusinda Force' }).select('id').first(),
            group: northEastHospital,
            group_admin: false,
        },
        {
            user: knex('users').where({ name: 'admin' }).select('id').first(),
            group: northEastHospital,
            group_admin: false,
        },
    ]);

    await knex('group_users').insert([
        {
            user: knex('users').where({ name: 'admin' }).select('id').first(),
            group: gmpFrontline,
            group_admin: true,
        },
        {
            user: knex('users').where({ name: 'Nata Penny' }).select('id').first(),
            group: gmpFrontline,
            group_admin: true,
        },
        {
            user: knex('users').where({ name: 'xXx_RAWSTEEL_xXx' }).select('id').first(),
            group: gmpFrontline,
            group_admin: true,
        },
        {
            user: knex('users').where({ name: 'Jonas' }).select('id').first(),
            group: gmpFrontline,
            group_admin: false,
        },
        {
            user: knex('users').where({ name: 'test-user-seed' }).select('id').first(),
            group: gmpFrontline,
            group_admin: false,
        },
        {
            user: knex('users').where({ name: 'Yusinda Force' }).select('id').first(),
            group: gmpFrontline,
            group_admin: false,
        },
    ]);
};
