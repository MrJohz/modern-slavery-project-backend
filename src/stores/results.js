exports.ResultStore = class ResultStore {

    constructor(knex) {
        this._knex = knex;
    }

    async insertResult(response) {
        await this._knex('results')
            .insert({ response: JSON.stringify(response) });
    }

};
