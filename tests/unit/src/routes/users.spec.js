const demand = require('must');
const sinon = require('sinon');
const { UserExistsError } = require("../../../../src/stores/users");
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

    describe('create', () => {

        let reply;
        beforeEach(() => {
            reply = sinon.spy();
        });

        it(`should return an error if payload does not exist`, async () => {
            const dummyUserStore = {};
            const request = { payload: null };

            const { create } = userRoutes({ userStore: dummyUserStore });
            await create(request, reply);

            demand(reply.callCount).equal(1);

            const replyErr = reply.getCall(0).args[0];
            demand(replyErr.isBoom).to.be.true();
            demand(replyErr.output.statusCode).to.equal(400);
            demand(replyErr.message).to.equal('invalid payload sent');
            demand(replyErr.data.validationErrors).to.eql([
                'key not found: name',
                'key not found: email',
                'key not found: password',
            ]);
        });

        it(`should return an error if payload does not contain the correct keys`, async () => {
            const dummyUserStore = {};
            const request = {
                payload: { password: 'test' }
            };

            const { create } = userRoutes({ userStore: dummyUserStore });
            await create(request, reply);

            demand(reply.callCount).equal(1);

            const replyErr = reply.getCall(0).args[0];
            demand(replyErr.isBoom).to.be.true();
            demand(replyErr.output.statusCode).to.equal(400);
            demand(replyErr.message).to.equal('invalid payload sent');
            demand(replyErr.data.validationErrors).to.eql([
                'key not found: name',
                'key not found: email',
            ]);
        });

        it(`should return an error if email address is already in use`, async () => {
            const dummyUserStore = {
                createUser: sinon.stub().returns(Promise.reject(new UserExistsError('email already in use')))
            };

            const request = {
                payload: {
                    name: 'kevin',
                    email: 'test@test.test',
                    password: 'test',
                }
            };

            const { create } = userRoutes({ userStore: dummyUserStore });
            await create(request, reply);

            demand(reply.callCount).equal(1);

            const replyErr = reply.getCall(0).args[0];
            demand(replyErr.isBoom).to.be.true();
            demand(replyErr.output.statusCode).to.equal(400);
            demand(replyErr.message).to.equal('invalid payload sent');
            demand(replyErr.data.validationErrors).to.eql([
                'email already in use',
            ]);

            demand(dummyUserStore.createUser.callCount).equal(1);
            demand(dummyUserStore.createUser.getCall(0).args).eql([request.payload]);
        });

        it(`should return the user if the user can be successfully created`, async () => {
            const expectedUser = {
                name: 'test'
            };

            const dummyUserStore = {
                createUser: sinon.stub().returns(Promise.resolve(expectedUser))
            };

            const request = {
                payload: {
                    name: 'kevin',
                    email: 'test@test.test',
                    password: 'test',
                }
            };

            const { create } = userRoutes({ userStore: dummyUserStore });
            await create(request, reply);

            demand(reply.callCount).equal(1);
            demand(reply.getCall(0).args).eql([expectedUser]);

            demand(dummyUserStore.createUser.callCount).equal(1);
            demand(dummyUserStore.createUser.getCall(0).args).eql([request.payload]);
        });

    });

    describe('remove', () => {

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
                const { remove } = userRoutes({ userStore: dummyUserStore });

                await remove(request, reply);

                demand(reply.callCount).equal(1);
                demand(reply.getCall(0).args).eql([badRequest(`could not coerce '${request.params.id}' to int`)])
            });
        }

        it(`should return an empty response if the delete was successful`, async () => {
            const request = {
                params: { id: '15' }
            };

            const dummyUserStore = {
                deleteUserById: sinon.stub().returns(Promise.resolve(true))
            };

            const { remove } = userRoutes({ userStore: dummyUserStore });

            await remove(request, reply);

            demand(reply.callCount).equal(1);
            demand(reply.getCall(0).args).eql([]);

            demand(dummyUserStore.deleteUserById.callCount).equal(1);
            demand(dummyUserStore.deleteUserById.getCall(0).args).eql([15]);
        });

        it(`should return an error if no user can be found`, async () => {
            const request = {
                params: { id: '15' }
            };

            const dummyUserStore = {
                deleteUserById: sinon.stub().returns(Promise.resolve(false))
            };

            const { remove } = userRoutes({ userStore: dummyUserStore });

            await remove(request, reply);

            demand(dummyUserStore.deleteUserById.callCount).equal(1);
            demand(dummyUserStore.deleteUserById.getCall(0).args).eql([15]);

            demand(reply.callCount).equal(1);
            demand(reply.getCall(0).args).eql([notFound(`could not find user with id ${request.params.id}`)]);
        });

    });

});
