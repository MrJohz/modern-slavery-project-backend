const demand = require('must');
require('../../../utils/must-user')(demand);

const { UserKnexStore } = require('../../../../src/stores/users');
const { create } = require('../../../../src/knex');

describe('stores/users', () => {

    describe('UserKnexStore', () => {

        let knex;
        let store;
        beforeEach(async () => {
            knex = create('test');
            await knex.migrate.latest();

            // add some example groups
            await knex('groups').insert({
                name: 'North East Hospital',
                description: 'For hospital staff at the NEH',
            });

            await knex('groups').insert({
                name: 'GMP Frontline',
                description: 'Frontline officers for Greater Manchester Police',
            });

            await knex('groups').insert({
                name: 'Charities MDS Coalition',
                description: 'Consortium of users from charities',
            });

            store = new UserKnexStore(knex);
        });

        afterEach(async () => {
            await knex.destroy();
        });

        async function getIdForGroup(groupName) {
            return (await knex('groups').where({ name: groupName }).select('id').first()).id;
        }

        describe('getUserById', () => {

            it('should return null when passed a non-existent ID', async () => {
                const user = await store.getUserById(1);

                demand(user).to.be.null();
            });

            it('should return a user with an empty group list', async () => {
                await knex('users').insert({
                    id: 1,
                    name: 'admin',
                    email: 'test@test.com',
                    password: 'fb8e16a454dfce1e8824550e7022d37de2e634f7624b8383f4a39ec75df7249b',
                    site_admin: true
                });

                const user = await store.getUserById(1);

                demand(user).to.be.User({
                    id: 1,
                    name: 'admin',
                    email: 'test@test.com',
                    site_admin: true,
                    memberOf: [],
                    administrates: [],
                });
            });

            it('should return a user with groups and administration rights', async () => {
                await knex('users').insert({
                    id: 1,
                    name: 'admin',
                    email: 'test@test.com',
                    password: 'fb8e16a454dfce1e8824550e7022d37de2e634f7624b8383f4a39ec75df7249b',
                    site_admin: true
                });

                await knex('group_users').insert({
                    user: 1,
                    group: await getIdForGroup('North East Hospital'),
                    group_admin: false,
                });

                await knex('group_users').insert({
                    user: 1,
                    group: await getIdForGroup('GMP Frontline'),
                    group_admin: true,
                });

                const user = await store.getUserById(1);

                demand(user).to.be.User({
                    id: 1,
                    name: 'admin',
                    email: 'test@test.com',
                    site_admin: true,
                    memberOf: await Promise.all([getIdForGroup('North East Hospital'), getIdForGroup('GMP Frontline')]),
                    administrates: [await getIdForGroup('GMP Frontline')],
                });
            });

        });

        describe('getAllUsers', () => {

            it('should return an empty array if no users exist', async () => {
                const user = await store.getAllUsers();

                demand(user).to.be.empty();
            });

            it('should return users with no groups, groups, and admin rights', async () => {
                await knex('users').insert({
                    id: 1,
                    name: 'admin',
                    email: 'test@test.com',
                    password: 'fb8e16a454dfce1e8824550e7022d37de2e634f7624b8383f4a39ec75df7249b',
                    site_admin: true
                });

                await knex('users').insert({
                    id: 2,
                    name: 'jemimah',
                    email: 'jem@test.com',
                    password: 'fb8e16a454dfce1e8824550e7022d37de2e634f7624b8383f4a39ec75df7249b',
                    site_admin: false
                });

                await knex('users').insert({
                    id: 3,
                    name: 'kristoff',
                    email: 'kris@test.com',
                    password: 'fb8e16a454dfce1e8824550e7022d37de2e634f7624b8383f4a39ec75df7249b',
                    site_admin: false
                });

                await knex('group_users').insert({
                    user: 2,
                    group: await getIdForGroup('North East Hospital'),
                    group_admin: false,
                });

                await knex('group_users').insert({
                    user: 3,
                    group: await getIdForGroup('GMP Frontline'),
                    group_admin: false,
                });

                await knex('group_users').insert({
                    user: 3,
                    group: await getIdForGroup('North East Hospital'),
                    group_admin: true,
                });

                const user = await store.getAllUsers();

                demand(user).to.be.Users({
                        id: 1,
                        name: 'admin',
                        email: 'test@test.com',
                        site_admin: true,
                        memberOf: [],
                        administrates: [],
                    },
                    {
                        id: 2,
                        name: 'jemimah',
                        email: 'jem@test.com',
                        site_admin: false,
                        memberOf: [await getIdForGroup('North East Hospital')],
                        administrates: [],
                    },
                    {
                        id: 3,
                        name: 'kristoff',
                        email: 'kris@test.com',
                        site_admin: false,
                        memberOf: [await getIdForGroup('North East Hospital'), await getIdForGroup('GMP Frontline')],
                        administrates: [await getIdForGroup('North East Hospital')],
                    },
                );
            });

        });

    });

});

