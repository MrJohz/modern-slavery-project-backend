exports.ResultStore = class ResultStore {

    constructor(knex) {
        this._knex = knex;
    }

    async insertResult(user, language, response) {
        await this._knex('results')
            .insert({ user, language, response: JSON.stringify(response) });
    }

};
