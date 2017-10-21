const demand = require('must');
const sinon = require('sinon');
const { badRequest, notFound } = require('boom');

const { route: groupRoutes } = require('../../../../src/routes/groups');

describe('routes/groups', () => {

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

                const dummyGroupStore = {};
                const { fetchOne } = groupRoutes({ groupStore: dummyGroupStore });

                await fetchOne(request, reply);

                demand(reply.callCount).equal(1);
                demand(reply.getCall(0).args).eql([badRequest(`could not coerce '${request.params.id}' to int`)])
            });
        }

        it(`should return the correct group if a valid ID is passed`, async () => {
            const expectedGroup = { id: 15, name: 'test-group' };

            const request = {
                params: { id: '15' }
            };

            const dummyGroupStore = {
                getGroupById: sinon.stub().returns(expectedGroup)
            };

            const { fetchOne } = groupRoutes({ groupStore: dummyGroupStore });

            await fetchOne(request, reply);

            demand(reply.callCount).equal(1);
            demand(reply.getCall(0).args).eql([expectedGroup]);

            demand(dummyGroupStore.getGroupById.callCount).equal(1);
            demand(dummyGroupStore.getGroupById.getCall(0).args).eql([15]);
        });

        it(`should return an error if no group can be found`, async () => {
            const request = {
                params: { id: '15' }
            };

            const dummyGroupStore = {
                getGroupById: sinon.stub().returns(null)
            };

            const { fetchOne } = groupRoutes({ groupStore: dummyGroupStore });

            await fetchOne(request, reply);

            demand(dummyGroupStore.getGroupById.callCount).equal(1);
            demand(dummyGroupStore.getGroupById.getCall(0).args).eql([15]);

            demand(reply.callCount).equal(1);
            demand(reply.getCall(0).args).eql([notFound(`could not find group with id ${request.params.id}`)]);
        });

    });

    describe('fetchAll', () => {

        let reply;
        beforeEach(() => {
            reply = sinon.spy();
        });

        it(`should reply with the result of fetching all groups`, async () => {
            const expectedGroups = [{ id: 15, name: 'test-group' }];

            const request = {};

            const dummyGroupStore = {
                getAllGroups: sinon.stub().returns(expectedGroups)
            };

            const { fetchAll } = groupRoutes({ groupStore: dummyGroupStore });

            await fetchAll(request, reply);

            demand(reply.callCount).equal(1);
            demand(reply.getCall(0).args).eql([expectedGroups]);

            demand(dummyGroupStore.getAllGroups.callCount).equal(1);
            demand(dummyGroupStore.getAllGroups.getCall(0).args).eql([]);

        });
    });

});
