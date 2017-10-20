const demand = require('must');
const sinon = require('sinon');
const { badRequest, notFound } = require('boom');

const { route: userRoutes } = require('../../../../src/routes/users');

describe('routes/users', () => {

    describe('fetchOne', () => {

        let reply;
        beforeEach(() => {
            reply = sinon.spy();
        });

        for (const param of ['000uiop', 'qwer0000', 'asdf']) {
            it(`should fail if the id parameter is not an integer (${param})`, async () => {
                const request = {
                    params: { id: param }
                };

                const dummyUserStore = {};
                const { fetchOne } = userRoutes({ userStore: dummyUserStore });

                await fetchOne(request, reply);

                demand(reply.callCount).equal(1);
                demand(reply.getCall(0).args).eql([badRequest(`could not coerce '${request.params.id}' to int`)])
            });
        }

        it(`should return the correct user if a valid ID is passed`, async () => {
            const expectedUser = { id: 15, name: 'test-user' };

            const request = {
                params: { id: '15' }
            };

            const dummyUserStore = {
                getUserById: sinon.stub().returns(expectedUser)
            };

            const { fetchOne } = userRoutes({ userStore: dummyUserStore });

            await fetchOne(request, reply);

            demand(reply.callCount).equal(1);
            demand(reply.getCall(0).args).eql([expectedUser]);

            demand(dummyUserStore.getUserById.callCount).equal(1);
            demand(dummyUserStore.getUserById.getCall(0).args).eql([15]);
        });

        it(`should return an error if no user can be found`, async () => {
            const request = {
                params: { id: '15' }
            };

            const dummyUserStore = {
                getUserById: sinon.stub().returns(null)
            };

            const { fetchOne } = userRoutes({ userStore: dummyUserStore });

            await fetchOne(request, reply);

            demand(dummyUserStore.getUserById.callCount).equal(1);
            demand(dummyUserStore.getUserById.getCall(0).args).eql([15]);

            demand(reply.callCount).equal(1);
            demand(reply.getCall(0).args).eql([notFound(`could not find user with id ${request.params.id}`)]);
        });

    });

    describe('fetchAll', () => {

        let reply;
        beforeEach(() => {
            reply = sinon.spy();
        });

        it(`should reply with the result of fetching all users`, async () => {
            const expectedUsers = [{ id: 15, name: 'test-user' }];

            const request = {};

            const dummyUserStore = {
                getAllUsers: sinon.stub().returns(expectedUsers)
            };

            const { fetchAll } = userRoutes({ userStore: dummyUserStore });

            await fetchAll(request, reply);

            demand(reply.callCount).equal(1);
            demand(reply.getCall(0).args).eql([expectedUsers]);

            demand(dummyUserStore.getAllUsers.callCount).equal(1);
            demand(dummyUserStore.getAllUsers.getCall(0).args).eql([]);

        });
    });

});
