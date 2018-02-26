exports.AbstractKnexStore = class KnexStore {

    constructor(knex) {
        this.__knex = knex;
    }

    getTableWithTransaction(tableName, maybeTrx) {
        const table = this.__knex(tableName);
        if (maybeTrx) {
            table.transacting(maybeTrx);
        }

        return table;
    }

    beginTransaction(maybeTrx, operation) {
        if (maybeTrx) {  // transaction already exists - continue it
            return operation(maybeTrx);
        } else {
            return this.__knex.transaction(operation);
        }
    }

};
