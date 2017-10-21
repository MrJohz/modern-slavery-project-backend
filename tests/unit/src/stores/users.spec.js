const demand = require('must');
const knex = require('knex');
const knexMocker = require('mock-knex');
const { User } = require("../../../../src/models/users");

const { UserKnexStore } = require('../../../../src/stores/users');

describe('stores/user', () => {

    let knexFixture;
    let knexTracker;

    beforeEach(() => {
        knexFixture = knex({
            client: 'sqlite3',
            connection: { filename: ':memory:' },
            useNullAsDefault: true,
        });
        knexMocker.mock(knexFixture);
        knexTracker = knexMocker.getTracker();
        knexTracker.install();
    });

    afterEach(() => {
        knexTracker.uninstall();
        knexMocker.unmock(knexFixture);
    });

    describe('getUserById', () => {

        it('should return null if no users found', async () => {

            knexTracker.on('query', query => {
                query.response([]);
            });

            const userStore = new UserKnexStore(knexFixture);
            let user = await userStore.getUserById(45);

            demand(user).to.be.null();
        });

        it('should return a user with empty groups if user is part of no groups', async () => {

            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: null,
                        group_admin: null
                    },
                ]);
            });

            const userStore = new UserKnexStore(knexFixture);
            let user = await userStore.getUserById(45);

            demand(user).to.eql(new User({
                id: 45,
                name: 'kevin',
                email: 'kevin@kevin.kevin',
                site_admin: false,
                memberOf: [],
                administrates: [],
            }));
        });

        it('should return a user with groups for each group returned by query', async () => {

            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 54,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 12,
                        group_admin: false
                    },
                ]);
            });

            const userStore = new UserKnexStore(knexFixture);
            let user = await userStore.getUserById(45);

            demand(user).to.eql(new User({
                id: 45,
                name: 'kevin',
                email: 'kevin@kevin.kevin',
                site_admin: false,
                memberOf: [54, 12],
                administrates: [],
            }));
        });

        it('should return a user with administrated groups for each group returned by query', async () => {

            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 54,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 12,
                        group_admin: true
                    },
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 16,
                        group_admin: true
                    },
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 18,
                        group_admin: false
                    },
                ]);
            });

            const userStore = new UserKnexStore(knexFixture);
            let user = await userStore.getUserById(45);

            demand(user).to.eql(new User({
                id: 45,
                name: 'kevin',
                email: 'kevin@kevin.kevin',
                site_admin: false,
                memberOf: [54, 12, 16, 18],
                administrates: [12, 16],
            }));
        });

    });

    describe('getAllUsers', () => {

        it('should return an empty array if no users found', async () => {
            knexTracker.on('query', query => {
                query.response([]);
            });

            const userStore = new UserKnexStore(knexFixture);
            let user = await userStore.getAllUsers();

            demand(user).to.eql([]);
        });

        it('should return each user with no groups if user is in no groups', async () => {
            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: null,
                        group_admin: null
                    },
                    {
                        id: 36,
                        name: 'bab',
                        email: 'bab@bab.bab',
                        site_admin: true,
                        group: null,
                        group_admin: null
                    },
                ]);
            });

            const userStore = new UserKnexStore(knexFixture);
            let user = await userStore.getAllUsers();

            demand(user).to.eql([
                new User({
                    id: 45,
                    name: 'kevin',
                    email: 'kevin@kevin.kevin',
                    site_admin: false,
                    memberOf: [],
                    administrates: [],
                }),
                new User({
                    id: 36,
                    name: 'bab',
                    email: 'bab@bab.bab',
                    site_admin: true,
                    memberOf: [],
                    administrates: [],
                }),
            ]);
        });

        it('should return each user with groups if user is in at least 1 group', async () => {
            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 12,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 1,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 18,
                        group_admin: false
                    },
                    {
                        id: 36,
                        name: 'bab',
                        email: 'bab@bab.bab',
                        site_admin: true,
                        group: 1,
                        group_admin: false
                    },
                ]);
            });

            const userStore = new UserKnexStore(knexFixture);
            let user = await userStore.getAllUsers();

            demand(user).to.eql([
                new User({
                    id: 45,
                    name: 'kevin',
                    email: 'kevin@kevin.kevin',
                    site_admin: false,
                    memberOf: [12, 1, 18],
                    administrates: [],
                }),
                new User({
                    id: 36,
                    name: 'bab',
                    email: 'bab@bab.bab',
                    site_admin: true,
                    memberOf: [1],
                    administrates: [],
                }),
            ]);
        });

        it('should return each user with admin groups if user is admin of at least 1 group', async () => {
            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 12,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 1,
                        group_admin: true
                    },
                    {
                        id: 45,
                        name: 'kevin',
                        email: 'kevin@kevin.kevin',
                        site_admin: false,
                        group: 18,
                        group_admin: false
                    },
                    {
                        id: 36,
                        name: 'bab',
                        email: 'bab@bab.bab',
                        site_admin: true,
                        group: 13,
                        group_admin: true
                    },
                    {
                        id: 36,
                        name: 'bab',
                        email: 'bab@bab.bab',
                        site_admin: true,
                        group: 12,
                        group_admin: false
                    },
                ]);
            });

            const userStore = new UserKnexStore(knexFixture);
            let user = await userStore.getAllUsers();

            demand(user).to.eql([
                new User({
                    id: 45,
                    name: 'kevin',
                    email: 'kevin@kevin.kevin',
                    site_admin: false,
                    memberOf: [12, 1, 18],
                    administrates: [1],
                }),
                new User({
                    id: 36,
                    name: 'bab',
                    email: 'bab@bab.bab',
                    site_admin: true,
                    memberOf: [13, 12],
                    administrates: [13],
                }),
            ]);
        });

    });
});
