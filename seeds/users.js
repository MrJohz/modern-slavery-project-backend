const USERS = [
    {
        name: 'admin',
        email: 'test@test.com',
        password: 'fb8e16a454dfce1e8824550e7022d37de2e634f7624b8383f4a39ec75df7249b',
        site_admin: true
    },
    {
        name: 'test-user-seed',  // used to prove that these are seeded values, not real values
        email: 'test3@test.com',
        password: 'fb8e16a454dfce1e8824550e7022d37de2e634f7624b8383f4a39ec75df7249b',
        site_admin: false
    },
    {
        name: 'xXx_RAWSTEEL_xXx',
        email: 'asmalcombe0@ask.com',
        password: '6430c8a6c9676490497b35ad7e21d5b2d394602192aed43fbbf06a523f2830be',
        site_admin: false
    },
    {
        name: 'Jonas',
        email: 'jburde1@examiner.com',
        password: 'fb8e16a454dfce1e8824550e7022d37de2e634f7624b8383f4a39ec75df7249b',
        site_admin: false
    },
    {
        name: 'Yusinda Force',
        email: 'xforce2@boston.com',
        password: 'd71aebfce02cecf1f31cc061a68a8c51c2788ba37504e648b8977121d40cefe5',
        site_admin: false
    },
    {
        name: 'Kristøs Bâudinet',
        email: 'kbaudinet3@is.gd',
        password: 'e522cce22f3c004c7a4e419e63f983775f37828577a30017e1145c4611784cfa',
        site_admin: false
    },
    {
        name: 'Nata Penny',
        email: 'nsamworth4@mac.com',
        password: '4d2d05cdcfecba50d394dccf16f463b9bd241ecbdc176e794caedc44d64a910b',
        site_admin: false
    },
    {
        name: '孫德明',
        email: 'erufwa@mac.com',
        password: '4d2d05cdcfecba50d394dccf16f463b9bd241ecbdc176e794caedc44d64a910b',
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
        console.log(user.name);
        await knex('users').insert(user);
    }

    const northEastHospital = (await knex('groups').insert({
        id: 0,
        name: 'North East Hospital',
        description: 'For hospital staff at the NEH',
    }))[0];  // the awkward [0] syntax is because by default `insert` returns an array, even if the input is not an
             // array

    const gmpFrontline = (await knex('groups').insert({
        id: 1,
        name: 'GMP Frontline',
        description: 'Frontline officers for Greater Manchester Police',
    }))[0];

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
        }
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
        }
    ]);
};
