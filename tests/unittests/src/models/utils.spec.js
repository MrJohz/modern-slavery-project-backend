const demand = require('must');
const { required } = require('../../../../src/models/utils');

describe('models/utils', () => {

    describe('required', () => {

        it('should return the correct value if the key is in the object', () => {
            const obj = { testKey: Symbol() };

            demand(required(obj, 'testKey')).to.equal(obj.testKey);
        });

        it('should throw an error if the key is not in the object', () => {
            const obj = {};

            demand(() => required(obj, 'testKey'))
                .to.throw(Error, /testKey/);
        })

    });

});
