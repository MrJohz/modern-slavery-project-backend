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

        language(lang) {
            return knex('languages').select('id').where('english_name', lang)
        },

        procedure(name) {
            return knex('procedures').select('id').where('name', name);
        },

        answer(english_text, answer_to) {
            return knex('answers').select('id').where({ english_text, answer_to });
        },

        async addStep({ id: stepId, kind, ...rest }) {
            await knex('steps').insert({ id: stepId, kind: this.stepKind(kind) });

            if (kind === 'question') {
                const { question, answers, ...qLangs } = rest;

                await knex('questions').insert({
                    id: stepId, kind: this.stepKind(kind),
                    english_text: question,
                    procedure: this.procedure('default'),
                });

                qLangs['english'] = question;
                await knex('question_texts').insert(Object.keys(qLangs).map(lang => ({
                    text: qLangs[lang], question: stepId, language: this.language(lang),
                })));

                await knex('answers').insert(answers.map(answer => ({
                    english_text: answer.answer, answer_to: stepId, next_step: answer.link,
                })));

                const answer_texts = [];
                for (const { answer, link, ...aLangs } of answers) {

                    answer_texts.push(...Object.keys(aLangs).map(lang => ({
                        text: aLangs[lang],
                        answer: this.answer(answer, stepId),
                        language: this.language(lang),
                    })));

                    answer_texts.push({
                        text: answer,
                        answer: this.answer(answer, stepId),
                        language: this.language('english'),
                    });
                }

                await knex('answer_texts').insert(answer_texts);

            } else {
                const { forUser, forFacilitator, link, ...adviceLangs } = rest;

                await knex('advices').insert({
                    id: stepId, kind: this.stepKind(kind),
                    english_text: forUser,
                    facilitator_advice: forFacilitator,
                    next_step: link,
                    procedure: this.procedure('default'),
                });

                if (forUser != null) {
                    adviceLangs['english'] = forUser;
                    await knex('advice_texts').insert(Object.keys(adviceLangs).map(lang => ({
                        text: adviceLangs[lang], advice: stepId, language: this.language(lang),
                    })));
                }
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
        english_name: 'french', flags: 'bj,ci,ga', name: 'Français',
        lang_selection: `Bonjour, Je suis là pour vous aider. Cliquez ici pour continuer.`,
    }, {
        english_name: 'hungarian', flags: 'hu', name: 'Magyar',
        lang_selection: `Üdvözlöm. Segiteni szeretnék. Kérem kattintson ide hogy tovább lépjen.`,
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
        french: 'Avez-vous un travail\xa0?',
        hungarian: 'Van állása?',
        answers: [{
            answer: 'Yes',
            french: 'Oui',
            hungarian: 'Igen',
            link: 3,
        }, {
            answer: 'Not sure',
            french: 'Je ne sais pas',
            hungarian: 'Nem tudom',
            link: 2,
        }, {
            answer: 'No',
            french: 'Non',
            hungarian: 'Nem',
            link: 5,
        }],
    });

    await helpers.addStep({
        id: 2,
        kind: 'question',
        question: 'Does someone ask you to do things for them, and you are expected to do it?',
        french: 'Quelqu’un vous a-t-il déjà demandé de faire quelque chose, attendant de votre part que vous l’exécutiez sans question\xa0?',
        hungarian: 'Van valaki aki megbízza önt feladatokkal/kioszt önnek tennivalókat?',
        answers: [{
            answer: 'Yes',
            french: 'Oui',
            hungarian: 'Igen',
            link: 3,
        }, {
            answer: 'No',
            french: 'Non',
            hungarian: 'Nem',
            link: 5,
        }],
    });

    await helpers.addStep({
        id: 3,
        kind: 'question',
        question: 'Are you paid to do this work?',
        french: 'Êtes-vous payé pour faire ce travail\xa0?',
        hungarian: 'És ezért kap fizetést?',
        answers: [{
            answer: 'Yes',
            french: 'Oui',
            hungarian: 'Igen',
            link: 4,
        }, {
            answer: 'No',
            french: 'Non',
            hungarian: 'Nem',
            link: 11,
        }],
    });

    await helpers.addStep({
        id: 11,
        kind: 'advice',
        forUser: 'You have the right to be paid for any work that you do.  If you are not being paid, there are people you can talk to.',
        french: 'Vous avez le droit d’être payé pour n’importe quel travail que vous réalisez. Si ce n’est pas le cas, vous pouvez vous tourner vers des professionnels qui sont là pour vous aider.',
        hungarian: 'Jogában áll fizetést kapni bármilyen munka elvégzésére. Ha önt nem fizetik, van kihez forduljon segítségért.',
        forFacilitator: '*TODO*',
        link: 4,
    });

    await helpers.addStep({
        id: 4,
        kind: 'question',
        question: 'Could you stop doing this work if you wanted to?',
        french: 'Pourriez-vous arrêter de faire ce travail si vous le souhaitiez\xa0?',
        hungarian: 'Abba hagyhatná ezt a munkát ha szeretné?',
        answers: [{
            answer: 'Yes',
            french: 'Oui',
            hungarian: 'Igen',
            link: 5,
        }, {
            answer: `I don't know`,
            french: 'Je ne sais pas',
            hungarian: 'Nem tudom',
            link: 12,
        }, {
            answer: 'No',
            french: 'Non',
            hungarian: 'Nem',
            link: 12,
        }],
    });

    await helpers.addStep({
        id: 12,
        kind: 'advice',
        forUser: 'Coercion (forcing someone to do something against their will) is illegal.  If you believe you are being coerced, you can talk to people about this situation.',
        french: 'La coercition (forcer quelqu’un à faire quelque chose contre son gré) est illégale. Si vous pensez en être victime, vous pouvez le signaler aux services compétents.',
        hungarian: 'A kényszermunka (valakit bármilyen munka elvégzésére kényszerítése) törvény sértés. Ha önt fizetés nélküli munkára kényszerítik, van kihez forduljon segítségért.',
        forFacilitator: '*TODO*',
        link: 5,
    });

    await helpers.addStep({
        id: 5,
        kind: 'question',
        question: 'Are you able to come and go as you please from the place where you live?',
        french: 'Êtes-vous libre d’aller et venir de votre domicile comme vous le souhaitez\xa0?',
        hungarian: 'Szabadon járhat el a lakóhelyéről?',
        answers: [{
            answer: 'Yes',
            french: 'Oui',
            hungarian: 'Igen',
            link: 6,
        }, {
            answer: 'No',
            french: 'Non',
            hungarian: 'Nem',
            link: 13,
        }],
    });

    await helpers.addStep({
        id: 6,
        kind: 'question',
        question: 'Do you have to ask permission to eat, sleep, or go to the bathroom?',
        french: 'Devez-vous demander la permission pour manger, dormir ou aller aux toilettes\xa0?',
        hungarian: 'Van valaki akitől engedélyt kell kérnie hogy ehessen, aludhasson, vagy mosdóba mehessen?',
        answers: [{
            answer: 'Yes',
            french: 'Oui',
            hungarian: 'Igen',
            link: 13,
        }, {
            answer: 'No',
            french: 'Non',
            hungarian: 'Nem',
            link: 7,
        }],
    });

    await helpers.addStep({
        id: 7,
        kind: 'question',
        question: 'Are there locks on your doors/windows so you cannot get out?',
        french: 'Y a-t-il des verrous sur vos portes/fenêtres pour vous empêcher de sortir\xa0?',
        hungarian: 'Vannak zárak az ajtón vagy az ablakokon a lakóhelyén, amit nem tud kinyitni? Vagy amik akadályozzák hogy ki vay bejusson?',
        answers: [{
            answer: 'Yes',
            french: 'Oui',
            hungarian: 'Igen',
            link: 13,
        }, {
            answer: 'No',
            french: 'Non',
            hungarian: 'Nem',
            link: 8,
        }],
    });

    await helpers.addStep({
        id: 13,
        kind: 'advice',
        forUser: 'You should have permission to come and go as you please.  This includes being able to use the toilets, eat, and sleep freely, as well as being able to leave the house whenever you want.  If you are unable to leave the house, there are people you can talk to.',
        french: 'Vous devez être libre de vos mouvements. Cela inclut utiliser les toilettes, manger et dormir librement, aussi bien que de quitter votre domicile quand vous le souhaiter. Si vous n’êtes pas autorisé à quitter votre domicile, vous pouvez le signaler aux services compétents.',
        hungarian: 'Jogában áll jönni menni ahogyan szeretne. Ebbe bele tartozik a mosdó szabad használata, szabad éves, ivás, alvás, és a lakóhelye elhagyása engedély nélkül. Hogyha önt ezekben korlátozza bárki is, van kihez forduljon segítségért.',
        forFacilitator: '*TODO*',
        link: 8,
    });

    await helpers.addStep({
        id: 8,
        kind: 'question',
        question: 'Have you or your family been threatened in order to make you do something?',
        french: 'Avez-vous, ou un membre de votre famille, été menacé pour vous forcer à faire quelque chose\xa0?',
        hungarian: 'Fenyegették önt vagy családját azért hogy önt valamire kényszerítsék?',
        answers: [{
            answer: 'Yes',
            french: 'Oui',
            hungarian: 'Igen',
            link: 14,
        }, {
            answer: 'No',
            french: 'Non',
            hungarian: 'Nem',
            link: 9,
        }],
    });

    await helpers.addStep({
        id: 14,
        kind: 'advice',
        forUser: 'Coercion (forcing someone to do something against their will) is illegal.  If you believe you are being coerced, you can talk to people about this situation.',
        french: 'La coercition (forcer quelqu’un à faire quelque chose contre son gré) est illégale. Si vous pensez en être victime, vous pouvez le signaler aux services compétents.',
        hungarian: 'A kényszermunka (valakit bármilyen munka elvégzésére kényszerítése) törvény sértés. Ha önt fizetés nélküli munkára kényszerítik, van kihez forduljon segítségért.',
        forFacilitator: '*TODO*',
        link: 9,
    });

    await helpers.addStep({
        id: 9,
        kind: 'question',
        question: 'Has your identification or documentation been taken away from you?',
        french: 'Vos papiers d’identité ou documents personnels vous ont-ils été retirés\xa0?',
        hungarian: 'Elvetettek öntől bármilyen igazolványt, útlevelet, személyit?',
        answers: [{
            answer: 'Yes',
            french: 'Oui',
            hungarian: 'Igen',
            link: 15,
        }, {
            answer: 'No',
            french: 'Non',
            hungarian: 'Nem',
            link: 10,
        }],
    });

    await helpers.addStep({
        id: 15,
        kind: 'advice',
        forUser: 'It is against the law to take someone\'s documentation and identification away from them.  If this has happened, please talk to people about it.',
        french: 'Il est illégal de retirer à quelqu’un ses documents personnels et papiers d’identité. Si c’est votre cas, vous devez immédiatement en informer quelqu’un.',
        hungarian: 'Törvény ellenes valakitől elvenni a személyét igazoló dokumentumokat. Hogyha önnel ez történt, kérem szóljon valakinek erről.',
        forFacilitator: '*TODO*',
        link: 10,
    });

    await helpers.addStep({
        id: 10,
        kind: 'question',
        question: 'How old are you?',
        french: 'Quel âge avez-vous\xa0?',
        hungarian: 'Hány éves?',
        answers: [{
            answer: 'Under 18',
            french: 'Moins de 18 ans',
            hungarian: '18 év alatt',
            link: 16
        }, {
            answer: '18 or over',
            french: '18 ans et plus',
            hungarian: '18 év fölött',
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
