exports.LanguageStore = class LanguageStore {

    constructor(knex) {
        this._knex = knex;
    }

    async getAllLanguages() {
        const languages = await this._knex('languages')
            .select('id as id', 'flags as flags', 'name as languageName', 'lang_selection as welcomeText');

        return languages.map(language => ({
            ...language,
            introduction: `Hello.  I would like to ask you a few questions about your safety.  I'm using this phone so that we can communicate because I can't speak the same language as you.  I won't store any information about your identity - this is completely anonymous.  Each question has some answers for you to choose from, and you can click the buttons to choose each answer.  At the end, there will be some information about what you can do next.  At this point, you can give the phone back to me.

Click on the button at the bottom to continue.`,
            safe: `Thank you for taking the time to answer these questions.`,
            unsafe: `As a result of the questions I've been asking, I'm worried about your safety.  I would like to be able to refer you to other services so that they can help you.  If you do not want this to happen, click the button that says 'No'.  If I believe that you are under the age of 18, and in danger, I have a legal duty to refer you to these services.  However, where possible I will try to respect your wishes.`,
            flags: language.flags.split(','),
        }));
    }

};
