function helpersBuilder(knex) {
    return {
        async deleteAll() {
            const tables = [
                'advice_texts', 'question_texts', 'answer_texts',
                'advices', 'answers', 'questions',
                'steps',
                'procedures',
                'languages',
            ];
            for (const table of tables) {
                await knex(table).delete();
            }
        },

        stepKind(kind) {
            return knex('step_kinds').select('id').where('name', kind);
        },

        procedure(name) {
            return knex('procedures').select('id').where('name', name);
        },

        async addStep({ id, kind, ...rest }) {
            await knex('steps').insert({ id, kind: this.stepKind(kind) });

            if (kind === 'question') {
                const { question, answers } = rest;

                await knex('questions').insert({
                    id, kind: this.stepKind(kind),
                    english_text: question,
                    procedure: this.procedure('default'),
                });

                await knex('answers').insert(answers.map(answer => ({
                    english_text: answer.answer, answer_to: id, next_step: answer.link,
                })));
            } else {
                const { forUser, forFacilitator } = rest;

                await knex('advices').insert({
                    id, kind: this.stepKind(kind),
                    english_text: forUser,
                    facilitator_advice: forFacilitator,
                    procedure: this.procedure('default'),
                });
            }
        }
    }
}

exports.seed = async function (knex) {
    const helpers = helpersBuilder(knex);

    await helpers.deleteAll();

    await knex('languages').insert([{
        english_name: 'english', flags: 'gb,us,ca', name: 'English',
        welcome: `Hello, I'm here to help you.  Please click here to continue.`,
    }, {
        english_name: 'german', flags: 'de', name: 'Deutsch',
        welcome: `Hallo, ich bin hier, um dir zu helfen. Bitte klicken Sie hier um fortzufahren.`,
    }, {
        english_name: 'catalan', flags: 'es,ad', name: 'Català',
        welcome: `Hola, sóc aquí per ajudar-te. Feu clic aquí per continuar.`,
    }, {
        english_name: 'bosnian', flags: 'ba,rs', name: 'Bosanski',
        welcome: `Zdravo, tu sam da vam pomognem. Kliknite ovde da nastavite.`,
    }, {
        english_name: 'chinese', flags: 'cn,tw,sg,mm', name: '中文',
        welcome: `你好，我来帮你。请点击这里继续。`,
    }, {
        english_name: 'igbo', flags: 'ng,gq', name: 'Igbo',
        welcome: `Ndewo, m nọ ebe a iji nyere gị aka. Biko pịa ebe a iji gaa n'ihu.`,
    }, {
        english_name: 'punjabi', flags: 'pk,in', name: 'ਪੰਜਾਬੀ',
        welcome: `ਹੈਲੋ, ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ ਜਾਰੀ ਰੱਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਇੱਥੇ ਕਲਿੱਕ ਕਰੋ.`,
    }, {
        english_name: 'urdu', flags: 'pk,in,ae', name: 'اردو',
        welcome: `ہیلو، میں آپ کی مدد کرنے کے لئے یہاں ہوں. جاری رکھنے کیلئے یہاں کلک کریں.`,
    }]);

    await knex('procedures').insert({ id: 1, name: 'default', start: 1 });

    await helpers.addStep({
        id: 1,
        kind: 'question',
        question: 'Are you free to leave your home?',
        answers: [{
            answer: 'Yes',
            link: 2,
        }, {
            answer: 'Sometimes',
            link: 3,
        }, {
            answer: 'Never',
            link: 4,
        }],
    });

    await helpers.addStep({
        id: 2,
        kind: 'question',
        question: 'Are you a minor (less than 18 years old)?',
        answers: [{
            answer: 'Yes',
            link: 4,
        }, {
            answer: 'No',
            link: 5,
        }],
    });

    await helpers.addStep({
        id: 3,
        kind: 'question',
        question: 'Could you leave at any time if you wished?',
        answers: [{
            answer: 'Yes',
            link: 5,
        }, {
            answer: 'No',
            link: 4,
        }],
    });

    await helpers.addStep({
        id: 4,
        kind: 'advice',
        forUser: 'Call the police',
        forFacilitator: 'Make sure the user calls the police',
    });

    await helpers.addStep({
        id: 5,
        kind: 'advice',
        forUser: 'Nothing to do',
        forFacilitator: 'This person is not at risk',
    });
};
