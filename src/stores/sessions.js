const uuid = require('uuid/v4');
const moment = require('moment');

const { ExtendableError } = require("../models/errors");
const { AbstractKnexStore } = require("./abstract_store");
const { UserKnexStore, InvalidCredentialsError } = require("./users");
const { security } = require('../environment');

exports.RevalidationError = class RevalidationError extends ExtendableError {};
exports.OutOfDateError = class OutOfDateError extends ExtendableError {};
exports.SessionNotFound = class SessionNotFound extends ExtendableError {};

exports.SessionStore = class SessionStore extends AbstractKnexStore {

    constructor(knex) {
        super(knex);
        this._userStore = new UserKnexStore(knex);
    }

    async createSession(email, password, _trx) {
        const operation = async trx => {
            const userId = await this._userStore.validateUser(email, password, trx);

            if (userId == null) {
                throw new InvalidCredentialsError(`submitted email or password is incorrect`);
            }

            const session = {
                user: userId, id: uuid(),
                expires_at: moment().add(security.sessionTimeout, 'hours').toDate(),
                needs_revalidation: false,
            };

            await this.getTableWithTransaction('sessions', trx)
                .insert(session);

            session.user = await this._userStore.getUserById(userId, trx);
            return session;
        };

        return await this.beginTransaction(_trx, operation);
    }

    async getSession(sessionID, _trx) {
        return await this.beginTransaction(_trx, async trx => {
            const session = await this.getTableWithTransaction('sessions', trx)
                .where('id', sessionID)
                .select('*')
                .first();

            if (!session) {
                return null;
            }

            session.expires_at = new Date(session.expires_at);  // cast db value to Date
            session.needs_revalidation = !!session.needs_revalidation;  // boolean cast
            session.user = await this._userStore.getUserById(session.user, trx);

            return session;
        });
    }

    async refreshSession(sessionID, _trx) {
        return await this.beginTransaction(_trx, async trx => {
            const session = await this.getSession(sessionID, trx);
            if (session == null) {
                throw new exports.SessionNotFound(`session with id ${sessionID} cannot be found`);
            } else if (session.needs_revalidation) {
                throw new exports.RevalidationError(`session cannot be refreshed without validation`);
            } else if (moment(session.expires_at).isBefore(moment())) {
                throw new exports.OutOfDateError(`session has already expired, please revalidate`);
            }

            session.expires_at = moment().add(security.sessionTimeout, 'hours').toDate();

            await this.getTableWithTransaction('sessions', trx)
                .where('id', sessionID)
                .update({ expires_at: session.expires_at });

            return session;
        });
    }

    async refreshSessionWithValidation(sessionID, email, password, _trx) {
        return await this.beginTransaction(_trx, async trx => {
            const userId = await this._userStore.validateUser(email, password, trx);

            if (userId == null) {
                throw new InvalidCredentialsError(`submitted email or password is incorrect`);
            }

            const session = await this.getSession(sessionID, trx);

            if (session == null) {
                throw new exports.SessionNotFound(`session with id ${sessionID} cannot be found`);
            } else if (moment(session.expires_at).isBefore(moment())) {
                throw new exports.OutOfDateError(`session has already expired, please revalidate`);
            }

            session.expires_at = moment().add(security.sessionTimeout, 'hours').toDate();
            session.needs_revalidation = false;

            await this.getTableWithTransaction('sessions', trx)
                .where('id', sessionID)
                .update({ expires_at: session.expires_at, needs_revalidation: session.needs_revalidation });

            return session;
        });
    }

    async removeSession(sessionID, _trx) {
        const results = await this.getTableWithTransaction('sessions', _trx)
            .where('id', sessionID)
            .delete();

        return results > 0;
    }

    async removeAllSessions(userID, _trx) {
        await this.getTableWithTransaction('sessions', _trx)
            .where('user', userID)
            .delete();
    }
};
