const Film = require('../../lib/models/film');
const Studio = require('../../lib/models/studio');
const {assert} = require('chai');
const Actor = require('../../lib/models/actor');
describe('Film model',() => {
    it('validates with requierd fields', () => {
        const samN = new Actor({
            name: 'Sam Neill'
        });
        const studio = new Studio({
            name: 'Universal Studios',

        });
        const film = new Film({
            title: 'jurassic park',
            released: new Date('11 June 1993'),
            studio: studio._id,
            cast: [{
                actor: samN,
                role: 'Grant'
            }]
        });
        return film.validate();
    });
    it('fails validation when required fields are missing', () => {
        const film = new Film();

        return film.validate()
            .then( () => {
                throw new Error('Expected Validation error');
            }, ({errors}) =>{
                assert.ok(errors.title);
            });
    });
    //it('has valid studio name attached')
});
