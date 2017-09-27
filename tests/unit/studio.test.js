
const Studio = require('../../lib/models/studio');
const { assert } = require('chai');

describe('Studio model', () => {

    it('passes validation with required fields', () => {
        const studio = new Studio({
            name: 'Universal Pictures',

        });
        return studio.validate();
    });

    it('fails validation missing required fields', () => {

        const studio = new Studio();

        return studio.validate()
            .then(
                () => { throw new Error ('Expected validation error'); },
                ({ errors }) => {
                    assert.ok(errors.name);
                }
            );
    });

    it('fails validation with incorrect field type', () => {
        const studio = new Studio({
            name: {},
        });
        return studio.validate()
            .then(
                () => { throw new Error('Expected validation error'); },
                ({ errors }) => {
                    assert.ok(errors.name);
                }
            );
    });
});

