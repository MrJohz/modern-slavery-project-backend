const demand = require('must');

const {
    GroupKnexStore,
    UserNotFound,
    GroupNotFound,
    UserAlreadyAdded,
    UserNotInGroup,
} = require('../../../../src/stores/groups');

const { UserKnexStore } = require('../../../../src/stores/users');
const { create } = require('../../../../src/knex');

describe('stores/groups', () => {

    describe('GroupKnexStore', () => {

        let knex;
        let groupStore;
        let userStore;
        beforeEach(async () => {
            knex = create('test');

            await knex.migrate.latest();

            userStore = new UserKnexStore(knex);

            groupStore = new GroupKnexStore(knex);

            knex.client.on('start', builder => {
                builder.on('query', query => {
                    console.log(query);
                });
            });


        });

        afterEach(async () => {
            await knex.destroy();
        });

        describe('addUserToGroup', () => {

            it('should add the non-admin user to the specified group', async () => {

                await knex('groups').insert({
                    id: 1,
                    name: 'trevor',
                    description: 'kljakldjalsd',
                });

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await groupStore.addUserToGroup({ user: jonas.id, group: 1 });

                demand((await userStore.getUserById(jonas.id)).memberOf).to.contain(1);
                demand((await userStore.getUserById(jonas.id)).administrates).not.to.contain(1);

                demand((await groupStore.getGroupById(1)).users).to.contain(jonas.id);
                demand((await groupStore.getGroupById(1)).admins).not.to.contain(jonas.id);
            });

            it('should add the admin user to the specified group', async () => {

                await knex('groups').insert({
                    id: 1,
                    name: 'trevor',
                    description: 'kljakldjalsd',
                });

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await groupStore.addUserToGroup({ user: jonas.id, group: 1, isAdmin: true });

                demand((await userStore.getUserById(jonas.id)).memberOf).to.contain(1);
                demand((await userStore.getUserById(jonas.id)).administrates).to.contain(1);

                demand((await groupStore.getGroupById(1)).users).to.contain(jonas.id);
                demand((await groupStore.getGroupById(1)).admins).to.contain(jonas.id);
            });

            it('should throw an error if the user does not exist', async () => {

                await knex('groups').insert({
                    id: 1,
                    name: 'trevor',
                    description: 'kljakldjalsd',
                });

                await demand(groupStore.addUserToGroup({ user: -100 /* non-existent */, group: 1 }))
                    .to.reject.to.error(UserNotFound, /-100/);
            });

            it('should throw an error if the group does not exist', async () => {

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await demand(groupStore.addUserToGroup({ user: jonas.id, group: 1 }))
                    .to.reject.to.error(GroupNotFound, /1/);
            });

            it('should throw an error if the group is not provided', async () => {

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await demand(groupStore.addUserToGroup({ user: jonas.id }))
                    .to.reject.to.error(Error, /group/);
            });

            it('should throw an error if the user is not provided', async () => {

                await demand(groupStore.addUserToGroup({ group: 1 }))
                    .to.reject.to.error(Error, /user/);
            });

            it('should throw an error if the user is already in the group', async () => {

                await knex('groups').insert({
                    id: 1,
                    name: 'trevor',
                    description: 'kljakldjalsd',
                });

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await knex('group_users').insert({
                    user: jonas.id,
                    group: 1,
                    group_admin: false,
                });

                await demand(groupStore.addUserToGroup({ user: jonas.id, group: 1 }))
                    .to.reject.to.error(UserAlreadyAdded);

            });

        });

        describe('setUserAdmin', () => {

            it('should set a non-admin user in the group to admin', async () => {
                await knex('groups').insert({
                    id: 1,
                    name: 'trevor',
                    description: 'kljakldjalsd',
                });

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await knex('group_users').insert({
                    user: jonas.id,
                    group: 1,
                    group_admin: false,
                });

                await groupStore.setUserAdmin({ user: jonas.id, group: 1, isAdmin: true });

                demand((await userStore.getUserById(jonas.id)).memberOf).to.contain(1);
                demand((await userStore.getUserById(jonas.id)).administrates).to.contain(1);

                demand((await groupStore.getGroupById(1)).users).to.contain(jonas.id);
                demand((await groupStore.getGroupById(1)).admins).to.contain(jonas.id);
            });

            it('should set an admin user in the group to non-admin', async () => {
                await knex('groups').insert({
                    id: 1,
                    name: 'trevor',
                    description: 'kljakldjalsd',
                });

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await knex('group_users').insert({
                    user: jonas.id,
                    group: 1,
                    group_admin: true,
                });

                await groupStore.setUserAdmin({ user: jonas.id, group: 1, isAdmin: false });

                demand((await userStore.getUserById(jonas.id)).memberOf).to.contain(1);
                demand((await userStore.getUserById(jonas.id)).administrates).not.to.contain(1);

                demand((await groupStore.getGroupById(1)).users).to.contain(jonas.id);
                demand((await groupStore.getGroupById(1)).admins).not.to.contain(jonas.id);
            });

            it('should keep admin users admin if set to admin', async () => {
                await knex('groups').insert({
                    id: 1,
                    name: 'trevor',
                    description: 'kljakldjalsd',
                });

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await knex('group_users').insert({
                    user: jonas.id,
                    group: 1,
                    group_admin: true,
                });

                await groupStore.setUserAdmin({ user: jonas.id, group: 1, isAdmin: true });

                demand((await userStore.getUserById(jonas.id)).memberOf).to.contain(1);
                demand((await userStore.getUserById(jonas.id)).administrates).to.contain(1);

                demand((await groupStore.getGroupById(1)).users).to.contain(jonas.id);
                demand((await groupStore.getGroupById(1)).admins).to.contain(jonas.id);
            });

            it('should throw an error if the user does not exist', async () => {

                await knex('groups').insert({
                    id: 1,
                    name: 'trevor',
                    description: 'kljakldjalsd',
                });

                await demand(groupStore.setUserAdmin({ user: -100 /* non-existent */, group: 1, isAdmin: false }))
                    .to.reject.to.error(UserNotFound, /-100/);
            });

            it('should throw an error if the group does not exist', async () => {

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await demand(groupStore.setUserAdmin({ user: jonas.id, group: 1, isAdmin: false }))
                    .to.reject.to.error(GroupNotFound, /1/);
            });

            it('should throw an error if the group is not provided', async () => {

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await demand(groupStore.setUserAdmin({ user: jonas.id, isAdmin: false }))
                    .to.reject.to.error(Error, /group/);
            });

            it('should throw an error if the user is not provided', async () => {

                await demand(groupStore.setUserAdmin({ group: 1, isAdmin: false }))
                    .to.reject.to.error(Error, /user/);
            });

            it('should throw an error if the admin value is not provided', async () => {

                await demand(groupStore.setUserAdmin({ group: 1, user: 3 }))
                    .to.reject.to.error(Error, /isAdmin/);
            });

            it('should throw an error if the user is not in the group', async () => {

                await knex('groups').insert({
                    id: 1,
                    name: 'trevor',
                    description: 'kljakldjalsd',
                });

                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await demand(groupStore.setUserAdmin({ user: jonas.id, group: 1, isAdmin: false }))
                    .to.reject.to.error(UserNotInGroup);

            });

        });

        describe('createGroup', () => {

            it('should throw if name, description, or admin are not provided', async () => {
                await demand(groupStore.createGroup({name: 'test', description: 'test'}))
                    .to.reject.to.error(Error, /adminUser/);

                await demand(groupStore.createGroup({name: 'test', adminUser: 4}))
                    .to.reject.to.error(Error, /description/);

                await demand(groupStore.createGroup({description: 'test', adminUser: 4}))
                    .to.reject.to.error(Error, /name/);
            });

            it('should throw if the user or group does not exist');
            it('should create the group with the specified attributes');
            it('should add the specified user to the group as an admin');

        });

    });

});
