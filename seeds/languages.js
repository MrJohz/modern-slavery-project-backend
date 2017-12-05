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
                    next_step: rest.link,
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
        lang_selection: `Hello, I'm here to help you.  Please click here to continue.`,
    }, {
        english_name: 'german', flags: 'de', name: 'Deutsch',
        lang_selection: `Hallo, ich bin hier, um dir zu helfen. Bitte klicken Sie hier um fortzufahren.`,
    }, {
        english_name: 'catalan', flags: 'es,ad', name: 'Català',
        lang_selection: `Hola, sóc aquí per ajudar-te. Feu clic aquí per continuar.`,
    }, {
        english_name: 'bosnian', flags: 'ba,rs', name: 'Bosanski',
        lang_selection: `Zdravo, tu sam da vam pomognem. Kliknite ovde da nastavite.`,
    }, {
        english_name: 'chinese', flags: 'cn,tw,sg,mm', name: '中文',
        lang_selection: `你好，我来帮你。请点击这里继续。`,
    }, {
        english_name: 'igbo', flags: 'ng,gq', name: 'Igbo',
        lang_selection: `Ndewo, m nọ ebe a iji nyere gị aka. Biko pịa ebe a iji gaa n'ihu.`,
    }, {
        english_name: 'punjabi', flags: 'pk,in', name: 'ਪੰਜਾਬੀ',
        lang_selection: `ਹੈਲੋ, ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ ਜਾਰੀ ਰੱਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਇੱਥੇ ਕਲਿੱਕ ਕਰੋ.`,
    }, {
        english_name: 'urdu', flags: 'pk,in,ae', name: 'اردو',
        lang_selection: `ہیلو، میں آپ کی مدد کرنے کے لئے یہاں ہوں. جاری رکھنے کیلئے یہاں کلک کریں.`,
    }]);

    await knex('procedures').insert({ id: 1, name: 'default', start: 1 });

    await helpers.addStep({
        id: 1,
        kind: 'question',
        question: 'Do you have a job?',
        answers: [{
            answer: 'Yes',
            link: 3,
        }, {
            answer: 'Not sure',
            link: 2,
        }, {
            answer: 'No',
            link: 5,
        }],
    });

    await helpers.addStep({
        id: 2,
        kind: 'question',
        question: 'Does someone ask you to do things for them, and you are expected to do it?',
        answers: [{
            answer: 'Yes',
            link: 3,
        }, {
            answer: 'No',
            link: 5,
        }],
    });

    await helpers.addStep({
        id: 3,
        kind: 'question',
        question: 'Are you paid to do this work?',
        answers: [{
            answer: 'Yes',
            link: 4,
        }, {
            answer: 'No',
            link: 11,
        }],
    });

    await helpers.addStep({
        id: 11,
        kind: 'advice',
        forUser: 'You have the right to be paid for any work that you do.  If you are not being paid, there are people you can talk to.',
        forFacilitator: '*TODO*',
        link: 4,
    });

    await helpers.addStep({
        id: 4,
        kind: 'question',
        question: 'Could you stop doing this work if you wanted to?',
        answers: [{
            answer: 'Yes',
            link: 5,
        }, {
            answer: `I don't know`,
            link: 12,
        }, {
            answer: 'No',
            link: 12,
        }],
    });

    await helpers.addStep({
        id: 12,
        kind: 'advice',
        forUser: 'Coercion (forcing someone to do something against their will) is illegal.  If you believe you are being coerced, you can talk to people about this situation.',
        forFacilitator: '*TODO*',
        link: 5,
    });

    await helpers.addStep({
        id: 5,
        kind: 'question',
        question: 'Are you able to come and go as you please from the place where you live?',
        answers: [{
            answer: 'Yes',
            link: 6,
        }, {
            answer: 'No',
            link: 13,
        }],
    });

    await helpers.addStep({
        id: 6,
        kind: 'question',
        question: 'Do you have to ask permission to eat, sleep, or go to the bathroom?',
        answers: [{
            answer: 'Yes',
            link: 13,
        }, {
            answer: 'No',
            link: 7,
        }],
    });

    await helpers.addStep({
        id: 7,
        kind: 'question',
        question: 'Are there locks on your doors/windows so you cannot get out?',
        answers: [{
            answer: 'Yes',
            link: 13,
        }, {
            answer: 'No',
            link: 8,
        }],
    });

    await helpers.addStep({
        id: 13,
        kind: 'advice',
        forUser: 'You should have permission to come and go as you please.  This includes being able to use the toilets, eat, and sleep freely, as well as being able to leave the house whenever you want.  If you are unable to leave the house, there are people you can talk to.',
        forFacilitator: '*TODO*',
        link: 8,
    });

    await helpers.addStep({
        id: 8,
        kind: 'question',
        question: 'Have you or your family been threatened in order to make you do something?',
        answers: [{
            answer: 'Yes',
            link: 14,
        }, {
            answer: 'No',
            link: 9,
        }],
    });

    await helpers.addStep({
        id: 14,
        kind: 'advice',
        forUser: 'Coercion (forcing someone to do something against their will) is illegal.  If you believe you are being coerced, you can talk to people about this situation.',
        forFacilitator: '*TODO*',
        link: 9,
    });

    await helpers.addStep({
        id: 9,
        kind: 'question',
        question: 'Has your identification or documentation been taken away from you?',
        answers: [{
            answer: 'Yes',
            link: 15,
        }, {
            answer: 'No',
            link: 10,
        }],
    });

    await helpers.addStep({
        id: 15,
        kind: 'advice',
        forUser: 'It is against the law to take someone\'s documentation and identification away from them.  If this has happened, please talk to people about it.',
        forFacilitator: '*TODO*',
        link: 10,
    });

    await helpers.addStep({
        id: 10,
        kind: 'question',
        question: 'How old are you?',
        answers: [{
            answer: 'Under 18',
            link: 16
        }, {
            answer: '18 or over',
            link: null,
        }],
    });

    await helpers.addStep({
        id: 16,
        kind: 'advice',
        forUser: null,
        forFacilitator: 'This person is under 18',
        link: null,
    });
};
