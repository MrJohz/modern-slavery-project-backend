exports.ProcedureStore = class ProcedureStore {

    getProcedureById(_id, language) {
        return {
            start: 0,

            0: {
                kind: 'question',
                question: 'Are you free to leave your home?',
                answers: [{
                    answer: 'Yes',
                    link: 1,
                }, {
                    answer: 'Sometimes',
                    link: 2,
                }, {
                    answer: 'Never',
                    link: 3,
                }],
            },

            1: {
                kind: 'question',
                question: 'Are you a minor (less than 18 years old)?',
                answers: [{
                    answer: 'Yes',
                    link: 3,
                }, {
                    answer: 'No',
                    link: 4,
                }],
            },

            2: {
                kind: 'question',
                question: 'Could you leave at any time if you wished?',
                answers: [{
                    answer: 'Yes',
                    link: 4,
                }, {
                    answer: 'No',
                    link: 3,
                }],
            },

            3: {
                kind: 'advice',
                forUser: 'Call the police',
                forFacilitator: 'Make sure the user calls the police',
            },

            4: {
                kind: 'advice',
                forUser: 'Nothing to do',
                forFacilitator: 'This person is not at risk',
            },

        };
    }

};
