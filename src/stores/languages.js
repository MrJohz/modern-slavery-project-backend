exports.LanguageStore = class LanguageStore {

    constructor(knex) {
        this._knex = knex;
    }

    async getAllLanguages() {
        const languages = await this._knex('languages')
            .select('id as id', 'flags as flags', 'name as languageName', 'welcome as welcomeText');

        return languages.map(language => ({
            ...language,
            flags: language.flags.split(','),
        }));
    }

};
