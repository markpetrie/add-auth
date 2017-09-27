const Actor = require('../../lib/models/actor');
const {assert} = require('chai');
describe('Actor model',() =>{
    it('validates with required fields', () => {
        const actor = new Actor({
            name: 'Marilyn Monroe',
            dob: 'June 1, 1926',
            pob: 'Los Angeles, California, U.S'
        });
        return actor.validate();
    });
    it('fails validation when required fields are missing', () => {
        const actor = new Actor();

        return actor.validate()
            .then( () => {
                throw new Error('Expected Validation error');
            }, ({errors}) =>{
                assert.ok(errors.name);
            });
    });
});