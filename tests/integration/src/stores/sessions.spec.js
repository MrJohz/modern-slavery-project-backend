const demand = require('must');
require('../../../utils/must-user')(demand);

const moment = require('moment');

const { UserKnexStore, InvalidCredentialsError } = require('../../../../src/stores/users');
const { SessionStore, OutOfDateError, RevalidationError, SessionNotFound } = require('../../../../src/stores/sessions');
const { create } = require('../../../../src/knex');

function nowish() {
    const now = moment();
    return {
        start: now.clone().subtract(1, 'second'),
        end: now.clone().add(1, 'second')
    };
}

describe('stores/sessions', () => {

    describe('SessionStore', () => {

        let knex;
        let sessionStore;
        let userStore;
        beforeEach(async () => {
            knex = create('test');

            await knex.migrate.latest();

            userStore = new UserKnexStore(knex);
            sessionStore = new SessionStore(knex);

            knex.client.on('start', builder => {
                builder.on('query', query => {
                    console.log(query);
                });
            });


        });

        afterEach(async () => {
            await knex.destroy();
        });

        describe('createSession', () => {
            it('should create a new session is email and password are valid', async () => {
                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const session = await sessionStore.createSession(
                    'jburde1@examiner.com',
                    '[this is not a password]');

                demand(session.expires_at.getTime()).to.be.between(
                    nowish().start.add(8, 'hours').valueOf(),
                    nowish().end.add(8, 'hours').valueOf());

                demand(session.needs_revalidation).to.be.false();

                demand(session.user).to.be.User(jonas);
            });

            it('should not create a new session if the password is wrong', async () => {
                await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await demand(sessionStore.createSession('jburde1@examiner.com', '---'))
                    .to.reject.to.error(InvalidCredentialsError);
            });

            it('should not create a new session if the email is wrong', async () => {
                await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                await demand(sessionStore.createSession('kevin@no.com', '---'))
                    .to.reject.to.error(InvalidCredentialsError, /email.*password/);
            });

            it('should be possible to create multiple sessions at a time', async () => {
                await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const session1 = await sessionStore.createSession(
                    'jburde1@examiner.com',
                    '[this is not a password]');

                const session2 = await sessionStore.createSession(
                    'jburde1@examiner.com',
                    '[this is not a password]');

                demand(session2).not.to.eql(session1);
            })
        });

        describe('getSession', () => {
            it('should fetch the session details if session ID exists', async () => {
                await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const session = await sessionStore.createSession(
                    'jburde1@examiner.com',
                    '[this is not a password]');

                demand(await sessionStore.getSession(session.id)).to.eql(session);
            });

            it('should return null if session ID does not exist', async () => {
                demand(await sessionStore.getSession('non existent')).to.be.null();
            });
        });

        describe('refreshSession', () => {
            it('should update the expiry date of the session', async () => {
                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const sessionId = '123e4567-e89b-12d3-a456-426655440000';

                await knex('sessions').insert({
                    id: sessionId,
                    user: jonas.id,
                    expires_at: moment().add(2, 'hours').toDate(),
                    needs_revalidation: false,
                });

                const newSession = await sessionStore.refreshSession(sessionId);

                const { expires_at } = await knex('sessions').where('id', sessionId).first();
                demand(expires_at).to.be.between(
                    nowish().start.add(8, 'hours'),
                    nowish().end.add(8, 'hours'));

                demand(newSession.expires_at).to.be.between(
                    nowish().start.add(8, 'hours'),
                    nowish().end.add(8, 'hours'));

                demand(newSession.id).to.equal(sessionId);
                demand(newSession.user).to.be.User(jonas);
                demand(newSession.needs_revalidation).to.be.false();
            });

            it('should throw an error if the session does not exist', async () => {
                await demand(sessionStore.refreshSession('does not exist'))
                    .to.reject.to.error(SessionNotFound);
            });

            it('should throw an error if the session is out of date', async () => {
                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const sessionId = '123e4567-e89b-12d3-a456-426655440000';

                await knex('sessions').insert({
                    id: sessionId,
                    user: jonas.id,
                    expires_at: moment().subtract(2, 'hours').toDate(),
                    needs_revalidation: false,
                });

                await demand(sessionStore.refreshSession(sessionId))
                    .to.reject.to.error(OutOfDateError);
            });

            it('should throw an error if the session needs revalidation', async () => {
                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const sessionId = '123e4567-e89b-12d3-a456-426655440000';

                await knex('sessions').insert({
                    id: sessionId,
                    user: jonas.id,
                    expires_at: moment().add(2, 'hours').toDate(),
                    needs_revalidation: true,
                });

                await demand(sessionStore.refreshSession(sessionId))
                    .to.reject.to.error(RevalidationError);
            });
        });

        describe('refreshSessionWithValidation', () => {
            it('should update the expiry date of the session', async () => {
                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const sessionId = '123e4567-e89b-12d3-a456-426655440000';

                await knex('sessions').insert({
                    id: sessionId,
                    user: jonas.id,
                    expires_at: moment().add(2, 'hours').toDate(),
                    needs_revalidation: false,
                });

                const newSession = await sessionStore.refreshSessionWithValidation(sessionId,
                    jonas.email, '[this is not a password]');

                const { expires_at } = await knex('sessions').where('id', sessionId).first();
                demand(expires_at).to.be.between(
                    nowish().start.add(8, 'hours'),
                    nowish().end.add(8, 'hours'));

                demand(newSession.expires_at).to.be.between(
                    nowish().start.add(8, 'hours'),
                    nowish().end.add(8, 'hours'));

                demand(newSession.id).to.equal(sessionId);
                demand(newSession.user).to.be.User(jonas);
                demand(newSession.needs_revalidation).to.be.false();
            });

            it('should throw an error if the session is out of date', async () => {
                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const sessionId = '123e4567-e89b-12d3-a456-426655440000';

                await knex('sessions').insert({
                    id: sessionId,
                    user: jonas.id,
                    expires_at: moment().subtract(2, 'hours').toDate(),
                    needs_revalidation: false,
                });

                await demand(sessionStore.refreshSessionWithValidation(sessionId,
                    jonas.email, '[this is not a password]'))
                    .to.reject.to.error(OutOfDateError);
            });

            it('should revalidate if revalidation is needed', async () => {
                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const sessionId = '123e4567-e89b-12d3-a456-426655440000';

                await knex('sessions').insert({
                    id: sessionId,
                    user: jonas.id,
                    expires_at: moment().add(2, 'hours').toDate(),
                    needs_revalidation: true,
                });

                const newSession = await sessionStore.refreshSessionWithValidation(sessionId,
                    jonas.email, '[this is not a password]');

                const { expires_at } = await knex('sessions').where('id', sessionId).first();
                demand(expires_at).to.be.between(
                    nowish().start.add(8, 'hours'),
                    nowish().end.add(8, 'hours'));

                demand(newSession.expires_at).to.be.between(
                    nowish().start.add(8, 'hours'),
                    nowish().end.add(8, 'hours'));

                demand(newSession.id).to.equal(sessionId);
                demand(newSession.user).to.be.User(jonas);
                demand(newSession.needs_revalidation).to.be.false();
            });
        });

        describe('removeSession', () => {
            it('should delete the session', async () => {
                await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const session = await sessionStore.createSession(
                    'jburde1@examiner.com',
                    '[this is not a password]');

                await sessionStore.removeSession(session.id);

                demand(await sessionStore.getSession(session.id)).to.be.null();
            });

            it('should return false if session does not exist', async () => {
                demand(await sessionStore.removeSession('non existent')).to.be.false();
            });
        });

        describe('removeAllSessions', () => {
            it('should delete the session', async () => {
                const jonas = await userStore.createUser({
                    name: 'Jonas',
                    email: 'jburde1@examiner.com',
                    password: '[this is not a password]',
                    site_admin: false,
                });

                const sessions = await Promise.all(Array.from({length: 2})
                    .map(() => sessionStore.createSession('jburde1@examiner.com', '[this is not a password]')));

                await sessionStore.removeAllSessions(jonas.id);

                for (const session of sessions) {
                    demand(await sessionStore.getSession(session.id)).to.be.null();
                }
            });
        });
    });
});
