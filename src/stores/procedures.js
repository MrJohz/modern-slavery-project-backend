const { ExtendableError } = require("../models/errors");

exports.ProcedureNotFound = class ProcedureNotFound extends ExtendableError {};

exports.ProcedureStore = class ProcedureStore {

    constructor(knex) {
        this._knex = knex;
    }

    async getProcedureById(id, language) {

        return await this._knex.transaction(async trx => {
            const start = await this._knex('procedures')
                .transacting(trx)
                .select('start').where('id', id).first();
            if (!start) {
                throw new ProcedureNotFound(`Cannot find procedure ${id}`);
            }

            const result = { start: start.start };
            const toView = [start.start];

            while (toView.length > 0) {
                const viewId = toView.pop();

                const { id, kind, kindName } = await this._knex('steps')
                    .transacting(trx)
                    .where('steps.id', viewId)
                    .join('step_kinds', 'steps.kind', '=', 'step_kinds.id')
                    .select('steps.id as id', 'steps.kind as kind', 'step_kinds.name as kindName')
                    .first();

                if (kindName === 'question') {
                    const answers = await this._knex('questions')
                        .transacting(trx)
                        .leftJoin('question_texts', 'questions.id', '=', 'question_texts.question')
                        .leftJoin('answers', 'questions.id', '=', 'answers.answer_to')
                        .leftJoin('answer_texts', 'answers.id', '=', 'answer_texts.answer')
                        .where({
                            'questions.id': id, 'questions.kind': kind,
                            'question_texts.language': language,
                            'answer_texts.language': language,
                        })
                        .select('question_texts.text as question',
                            'answer_texts.text as answer',
                            'answers.next_step as link');

                    const question = { question: answers[0].question, answers: [], kind: kindName };
                    for (const answer of answers) {
                        if (answer.link && !result[answer.link]) {  // this link hasn't been followed yet
                            toView.push(answer.link);
                        }

                        question.answers.push({ answer: answer.answer, link: answer.link });
                    }

                    result[viewId] = question;
                } else {
                    const advice = await this._knex('advices')
                        .transacting(trx)
                        .leftJoin('advice_texts', 'advices.id', '=', 'advice_texts.advice')
                        .where({'advices.id': id, 'advices.kind': kind})
                        .andWhere(q =>
                            q.whereNull('advices.english_text')
                                .orWhere('advice_texts.language', language)
                        )
                        .select('advice_texts.text as forUser',
                            'advices.facilitator_advice as forFacilitator',
                            'advices.next_step as link')
                        .first();

                    console.log(advice);
                    advice.kind = kindName;
                    if (advice.link && !result[advice.link]) {
                        toView.push(advice.link);
                    }

                    result[viewId] = advice;
                }
            }

            return result;
        });
    }

};
