const demand = require('must');
const sinon = require("sinon");

const { power } = require('js-combinatorics');

const routing = require('../../../../src/plugins/routing');

describe('plugins/routing', () => {

    describe('register', () => {

        let next;
        beforeEach(() => {
            next = sinon.spy();
        });

        let mountPoints;

        mountPoints = [
            { provided: '/', expected: '' },  // bare route
            { provided: '/test', expected: '/test' },  // route without trailing slash
            { provided: '/test/', expected: '/test' },  // route with trailing slash
        ];
        for (const { provided, expected } of mountPoints) {
            it(`should mount fetchOne at GET ${expected}/{id}`, () => {
                const serverStub = { route: sinon.spy() };
                const fetchOneSpy = sinon.spy();

                const options = {
                    routes: [{
                        mount: provided, use: {
                            route() {
                                return { fetchOne: fetchOneSpy }
                            }
                        }
                    }]
                };

                routing.register(serverStub, options, next);

                demand(next.callCount).to.equal(1);
                demand(next.getCall(0).args).to.eql([]);

                demand(serverStub.route.callCount).to.equal(1);
                demand(serverStub.route.getCall(0).args).to.eql([{
                    method: 'GET',
                    path: `${expected}/{id}`,
                    handler: fetchOneSpy
                }]);
            });
        }

        mountPoints = [
            { provided: '/', expected: '/' },  // bare route
            { provided: '/test', expected: '/test' },  // route without trailing slash
            { provided: '/test/', expected: '/test' },  // route with trailing slash
        ];
        for (const { provided, expected } of mountPoints) {
            it(`should mount fetchAll at GET ${expected}`, () => {
                const serverStub = { route: sinon.spy() };
                const fetchAllSpy = sinon.spy();

                const options = {
                    routes: [{
                        mount: provided, use: {
                            route() {
                                return { fetchAll: fetchAllSpy }
                            }
                        }
                    }]
                };

                routing.register(serverStub, options, next);

                demand(next.callCount).to.equal(1);
                demand(next.getCall(0).args).to.eql([]);

                demand(serverStub.route.callCount).to.equal(1);
                demand(serverStub.route.getCall(0).args).to.eql([{
                    method: 'GET',
                    path: `${expected}`,
                    handler: fetchAllSpy
                }]);
            });
        }

        mountPoints = [
            { provided: '/', expected: '/' },  // bare route
            { provided: '/test', expected: '/test' },  // route without trailing slash
            { provided: '/test/', expected: '/test' },  // route with trailing slash
        ];
        for (const { provided, expected } of mountPoints) {
            it(`should mount create at POST ${expected}`, () => {
                const serverStub = { route: sinon.spy() };
                const createSpy = sinon.spy();

                const options = {
                    routes: [{
                        mount: provided, use: {
                            route() {
                                return { create: createSpy }
                            }
                        }
                    }]
                };

                routing.register(serverStub, options, next);

                demand(next.callCount).to.equal(1);
                demand(next.getCall(0).args).to.eql([]);

                demand(serverStub.route.callCount).to.equal(1);
                demand(serverStub.route.getCall(0).args).to.eql([{
                    method: 'POST',
                    path: `${expected}`,
                    handler: createSpy
                }]);
            });
        }

        mountPoints = [
            { provided: '/', expected: '' },  // bare route
            { provided: '/test', expected: '/test' },  // route without trailing slash
            { provided: '/test/', expected: '/test' },  // route with trailing slash
        ];
        for (const { provided, expected } of mountPoints) {
            it(`should mount remove at DELETE ${expected}/{id}`, () => {
                const serverStub = { route: sinon.spy() };
                const removeSpy = sinon.spy();

                const options = {
                    routes: [{
                        mount: provided, use: {
                            route() {
                                return { remove: removeSpy }
                            }
                        }
                    }]
                };

                routing.register(serverStub, options, next);

                demand(next.callCount).to.equal(1);
                demand(next.getCall(0).args).to.eql([]);

                demand(serverStub.route.callCount).to.equal(1);
                demand(serverStub.route.getCall(0).args).to.eql([{
                    method: 'DELETE',
                    path: `${expected}/{id}`,
                    handler: removeSpy
                }]);
            });
        }

        mountPoints = [
            { provided: '/', expected: '' },  // bare route
            { provided: '/test', expected: '/test' },  // route without trailing slash
            { provided: '/test/', expected: '/test' },  // route with trailing slash
        ];
        for (const { provided, expected } of mountPoints) {
            it(`should mount update at PATCH ${expected}/{id}`, () => {
                const serverStub = { route: sinon.spy() };
                const updateSpy = sinon.spy();

                const options = {
                    routes: [{
                        mount: provided, use: {
                            route() {
                                return { update: updateSpy }
                            }
                        }
                    }]
                };

                routing.register(serverStub, options, next);

                demand(next.callCount).to.equal(1);
                demand(next.getCall(0).args).to.eql([]);

                demand(serverStub.route.callCount).to.equal(1);
                demand(serverStub.route.getCall(0).args).to.eql([{
                    method: 'PATCH',
                    path: `${expected}/{id}`,
                    handler: updateSpy
                }]);
            });
        }

        mountPoints = [
            { provided: '/', expectWithId: '/{id}', expectWithoutId: '/' },  // bare route
            { provided: '/test', expectWithId: '/test/{id}', expectWithoutId: '/test' },  // route w/o trailing slash
            { provided: '/test/', expectWithId: '/test/{id}', expectWithoutId: '/test' },  // route w/ trailing slash
        ];
        for (const { provided, expectWithId, expectWithoutId } of mountPoints) {

            const fetchOneSpy = {withId: true, method: 'GET'};
            const fetchAllSpy = {withId: false, method: 'GET'};
            const createSpy = {withId: false, method: 'POST'};
            const removeSpy = {withId: true, method: 'DELETE'};
            const updateSpy = {withId: true, method: 'PATCH'};

            const methods = [
                { fetchOne: fetchOneSpy },
                { fetchAll: fetchAllSpy },
                { create: createSpy },
                { remove: removeSpy },
                { update: updateSpy },
            ];

            for (const combination of power(methods).toArray()) {
                const routes = Object.assign({}, ...combination);

                it(`should mount ${Object.keys(routes)} at the correct routes on ${provided}`, () => {
                    const serverStub = { route: sinon.spy() };

                    const options = {
                        routes: [{
                            mount: provided,
                            use: { route() { return routes } }
                        }]
                    };

                    routing.register(serverStub, options, next);

                    demand(next.callCount).to.equal(1);
                    demand(next.getCall(0).args).to.eql([]);

                    demand(serverStub.route.callCount).to.equal(combination.length);

                    for (const key of Object.keys(routes)) {
                        demand(serverStub.route.calledWith({
                            method: routes[key].method,
                            path: routes[key].withId ? expectWithId : expectWithoutId,
                            handler: routes[key]
                        })).to.be.true();
                    }
                })
            }
        }

    });

});
