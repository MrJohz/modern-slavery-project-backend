const demand = require('must');

const { UserKnexStore } = require('../../../../src/stores/users');
const { create } = require('../../../../src/knex');

describe('stores/users', () => {

    describe('UserKnexStore', () => {

        describe('getUserById', () => {

            let knex;
            let store;
            beforeEach(async () => {
                knex = create('test');
                await knex.migrate.latest();
                await knex.seed.run();
                store = new UserKnexStore(knex);
            });

            afterEach(async () => {
                await knex.destroy();
            });

            it('should return null when passed a non-existent ID', async () => {
                const user = await store.getUserById(10000);

                demand(user).to.be.null();
            });

        })

    });

});

