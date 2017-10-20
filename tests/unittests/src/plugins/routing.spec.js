const demand = require('must');
const sinon = require("sinon");
const routing = require('../../../../src/plugins/routing');

describe('plugins/routing', () => {

    describe('register', () => {

        let next;
        beforeEach(() => {
            next = sinon.spy();
        });

        const mountPoints = [
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

    });

});
