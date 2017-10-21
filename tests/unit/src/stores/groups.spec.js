const demand = require('must');
const knex = require('knex');
const knexMocker = require('mock-knex');
const { Group } = require("../../../../src/models/groups");

const { GroupKnexStore } = require('../../../../src/stores/groups');

describe('stores/groups', () => {

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

    describe('getGroupById', () => {

        it('should return null if no groups found', async () => {

            knexTracker.on('query', query => {
                query.response([]);
            });

            const groupStore = new GroupKnexStore(knexFixture);
            let group = await groupStore.getGroupById(45);

            demand(group).to.be.null();
        });

        it('should return a group with no users if group has no users', async () => {

            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: null,
                        group_admin: null
                    },
                ]);
            });

            const groupStore = new GroupKnexStore(knexFixture);
            let group = await groupStore.getGroupById(45);

            demand(group).to.eql(new Group({
                id: 45,
                name: 'hospital',
                description: 'hospital group',
                users: [],
                admins: []
            }));
        });

        it('should return a group with users if group contains users', async () => {

            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 34,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 12,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 16,
                        group_admin: false
                    },
                ]);
            });

            const groupStore = new GroupKnexStore(knexFixture);
            let group = await groupStore.getGroupById(45);

            demand(group).to.eql(new Group({
                id: 45,
                name: 'hospital',
                description: 'hospital group',
                users: [34, 12, 16],
                admins: []
            }));
        });

        it('should return a group with users and admins', async () => {

            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 34,
                        group_admin: true
                    },
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 12,
                        group_admin: true
                    },
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 16,
                        group_admin: false
                    },
                ]);
            });

            const groupStore = new GroupKnexStore(knexFixture);
            let group = await groupStore.getGroupById(45);

            demand(group).to.eql(new Group({
                id: 45,
                name: 'hospital',
                description: 'hospital group',
                users: [34, 12, 16],
                admins: [34, 12]
            }));
        });

    });

    describe('getAllGroups', () => {

        it('should return an empty array if no groups found', async () => {
            knexTracker.on('query', query => {
                query.response([]);
            });

            const groupStore = new GroupKnexStore(knexFixture);
            let group = await groupStore.getAllGroups();

            demand(group).to.eql([]);
        });

        it('should return each group with no users if group contains no users', async () => {
            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: null,
                        group_admin: null
                    },
                    {
                        id: 26,
                        name: 'police',
                        description: 'police group',
                        user: null,
                        group_admin: null
                    },
                ]);
            });

            const groupStore = new GroupKnexStore(knexFixture);
            let group = await groupStore.getAllGroups();

            demand(group).to.eql([
                new Group({
                    id: 45,
                    name: 'hospital',
                    description: 'hospital group',
                    users: [],
                    admins: []
                }),
                new Group({
                    id: 26,
                    name: 'police',
                    description: 'police group',
                    users: [],
                    admins: []
                }),
            ]);
        });

        it('should return each group with users if group contains at least 1 user', async () => {
            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 12,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 16,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'police',
                        description: 'police group',
                        user: 13,
                        group_admin: false
                    },
                    {
                        id: 26,
                        name: 'police',
                        description: 'police group',
                        user: 13,
                        group_admin: false
                    },
                ]);
            });

            const groupStore = new GroupKnexStore(knexFixture);
            let group = await groupStore.getAllGroups();

            demand(group).to.eql([
                new Group({
                    id: 45,
                    name: 'hospital',
                    description: 'hospital group',
                    users: [12, 16, 13],
                    admins: []
                }),
                new Group({
                    id: 26,
                    name: 'police',
                    description: 'police group',
                    users: [13],
                    admins: []
                }),
            ]);
        });

        it('should return each group with admin users if group has users and administrators', async () => {
            knexTracker.on('query', query => {
                query.response([
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 12,
                        group_admin: false
                    },
                    {
                        id: 45,
                        name: 'hospital',
                        description: 'hospital group',
                        user: 16,
                        group_admin: true
                    },
                    {
                        id: 45,
                        name: 'police',
                        description: 'police group',
                        user: 13,
                        group_admin: false
                    },
                    {
                        id: 26,
                        name: 'police',
                        description: 'police group',
                        user: 13,
                        group_admin: true
                    },
                ]);
            });

            const groupStore = new GroupKnexStore(knexFixture);
            let group = await groupStore.getAllGroups();

            demand(group).to.eql([
                new Group({
                    id: 45,
                    name: 'hospital',
                    description: 'hospital group',
                    users: [12, 16, 13],
                    admins: [16]
                }),
                new Group({
                    id: 26,
                    name: 'police',
                    description: 'police group',
                    users: [13],
                    admins: [13]
                }),
            ]);
        });

    });
});
