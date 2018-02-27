exports.register = function Router(server, options, next) {

    for (let { mount, use } of options.routes) {
        const handlers = use.route(options.context);

        if (mount.endsWith('/')) {
            mount = mount.slice(0, -1);
        }

        if ('fetchOne' in handlers) {
            server.route({
                method: 'GET',
                path: `${mount}/{id}`,
                config: {
                    response: { emptyStatusCode: 204 },
                    handler: handlers['fetchOne'],
                }
            });
        }

        if ('fetchAll' in handlers) {
            server.route({
                method: 'GET',
                path: mount ? `${mount}` : '/',  // special case for mount point being '/'
                config: {
                    response: { emptyStatusCode: 204 },
                    handler: handlers['fetchAll'],
                }
            });
        }

        if ('create' in handlers) {
            server.route({
                method: 'POST',
                path: mount ? `${mount}` : '/',  // special case for mount point being '/'
                config: {
                    response: { emptyStatusCode: 204 },
                    handler: handlers['create'],
                }
            });
        }

        if ('remove' in handlers) {
            server.route({
                method: 'DELETE',
                path: `${mount}/{id}`,
                config: {
                    response: { emptyStatusCode: 204 },
                    handler: handlers['remove'],
                }
            });
        }

        if ('update' in handlers) {
            server.route({
                method: 'PATCH',
                path: `${mount}/{id}`,
                config: {
                    response: { emptyStatusCode: 204 },
                    handler: handlers['update'],
                }
            });
        }

        if ('removeAll' in handlers) {
            server.route({
                method: 'DELETE',
                path: mount ? `${mount}` : '/',  // special case for mount point being '/'
                config: {
                    response: { emptyStatusCode: 204 },
                    handler: handlers['removeAll'],
                }
            })
        }
    }

    next();
};

exports.register.attributes = {
    name: 'rest-route-loader',
    version: require('../../package.json').version
};
