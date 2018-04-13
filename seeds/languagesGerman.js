exports.seed = async function (knex) {
    // some helpers
    const germanID = () => knex('languages').select('id').where('english_name', 'german');

    const question = (english_text) =>
        knex('questions').select('id').where({ english_text });
    const answer = (english_text, answer_to) =>
        knex('answers').select('id').where({ english_text, answer_to });
    const advice = (english_text) =>
        knex('advices').select('id').where({ english_text });

    const insertQuestion = async ([eng_question, text], answers) => {
        await knex('question_texts')
            .insert({
                language: germanID(),
                question: question(eng_question),
                text,
            });

        await knex('answer_texts')
            .insert(answers.map(([eng_answer, text]) => {
                return ({
                    language: germanID(),
                    answer: answer(eng_answer, question(eng_question)),
                    text
                });
            }));
    };


    await knex('question_texts')
        .where('language', germanID())
        .delete();
    await knex('answer_texts')
        .where('language', germanID())
        .delete();
    await knex('advice_texts')
        .where('language', germanID())
        .delete();

    await insertQuestion(
        ['Do you have a job?', 'Haben Sie eine Arbeitstelle?'],
        [
            ['Yes', 'Ja'],
            ['Not sure', 'Ich weiß es nicht'],
            ['No', 'Nein'],
        ]
    );

    await insertQuestion(
        [
            'Does someone ask you to do things for them, and you are expected to do it?',
            `Fordert jemand Sie auf, Dinge für ihn oder sie zu tun und es wird von Ihnen erwartet, dem Folge zu leisten?`
        ],
        [
            ['Yes', 'Ja'],
            ['No', 'Nein'],
        ]
    );

    await insertQuestion(
        [
            'Are you paid to do this work?',
            'Werden Sie für diese Arbeit bezahlt?'
        ],
        [
            ['Yes', 'Ja'],
            ['No', 'Nein'],
        ]
    );

    await knex('advice_texts')
        .insert({
            language: germanID(),
            advice: advice('You have the right to be paid for any work that you do.  If you are not being paid, there are people you can talk to.'),
            text: "Sie haben das Recht für jegliche Arbeit, die Sie leisten, bezahlt zu werden. Falls Sie nicht bezahlt werden, gibt es Menschen, an die Sie sich wenden können."
        });

    await insertQuestion(
        [
            'Could you stop doing this work if you wanted to?',
            `Könnten Sie diese Arbeit beenden, wenn Sie wöllten?`
        ],
        [
            ['Yes', 'Ja'],
            [`I don't know`, 'Ich weiß es nicht'],
            ['No', 'Nein'],
        ]
    );

    await knex('advice_texts')
        .insert({
            language: germanID(),
            advice: 12,  // magic number - there are two pieces of advice with the same text, so we can't look it up
            text: "Nötigung (jemanden dazu zwingen, etwas gegen seinen/ihren Willen zu tun) ist illegal. Wenn Sie glauben, genötigt zu werden, können Sie mit Menschen über diese Situation reden."
        });

    await insertQuestion(
        [
            'Are you able to come and go as you please from the place where you live?',
            "Sind Sie in der Lage, Ihren Wohnort zu betreten und verlassen wann Sie es möchten?"
        ],
        [
            ['Yes', 'Ja'],
            ['No', 'Nein'],
        ]
    );

    await insertQuestion(
        [
            'Do you have to ask permission to eat, sleep, or go to the bathroom?',
            "Müssen Sie um Erlaubnis fragen, um zu essen, zu schlafen, oder auf Toilette zu gehen?"
        ],
        [
            ['Yes', 'Ja'],
            ['No', 'Nein'],
        ]
    );

    await insertQuestion(
        [
            'Are there locks on your doors/windows so you cannot get out?',
            "Sind die Türen/Fenster verriegelt, sodass Sie nicht raus können?"
        ],
        [
            ['Yes', 'Ja'],
            ['No', 'Nein'],
        ]
    );

    await knex('advice_texts')
        .insert({
            language: germanID(),
            advice: advice('You should have permission to come and go as you please.  This includes being able to use the toilets, eat, and sleep freely, as well as being able to leave the house whenever you want.  If you are unable to leave the house, there are people you can talk to.'),
            text: "Ihnen sollte erlaubt sein, jederzeit zu kommen und zu gehen wie Sie möchten. Dazu gehört die Möglichkeit die Toilette zu benutzen, zu essen und zu schlafen, sowie das Haus zu verlassen wann immer Sie möchten. Falls Sie nicht in der Lage sind Ihr Haus zu verlassen, gibt es Menschen mit denen Sie sprechen können."
        });

    await insertQuestion(
        [
            'Have you or your family been threatened in order to make you do something?',
            "Wurden Sie oder Ihre Familie bedroht, um Sie zu etwas zu zwingen?"
        ],
        [
            ['Yes', 'Ja'],
            ['No', 'Nein'],
        ]
    );

    await knex('advice_texts')
        .insert({
            language: germanID(),
            advice: 14,  // magic number - there are two pieces of advice with the same text, so we can't look it up
            text: "Nötigung (jemanden dazu zwingen, etwas gegen seinen/ihren Willen zu tun) ist illegal. Wenn Sie glauben, genötigt zu werden, können Sie mit Menschen über diese Situation reden."
        });

    await insertQuestion(
        [
            'Has your identification or documentation been taken away from you?',
            "Wurden Ihnen Ihre Papiere und Ihr Ausweis weggenommen?"
        ],
        [
            ['Yes', 'Ja'],
            ['No', 'Nein'],
        ]
    );

    await knex('advice_texts')
        .insert({
            language: germanID(),
            advice: advice('It is against the law to take someone\'s documentation and identification away from them.  If this has happened, please talk to people about it.'),
            text: "Es ist gegen das Gesetz, jemandem die Papiere oder den Ausweis wegzunehmen. Falls Ihnen das passiert ist, sprechen Sie bitte mit jemandem darüber."
        });

    await insertQuestion(
        [
            'How old are you?',
            "Wie alt sind Sie?"
        ],
        [
            ['Under 18', 'Unter 18'],
            ['18 or over', '18 oder älter'],
        ]
    );
};
