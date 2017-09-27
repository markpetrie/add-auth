const Reviewer = require('../../lib/models/reviewer');
const { assert } = require('chai');

describe('Reviewer model', () => {

    it('passes validation with required fields', () => {
        const reviewer = new Reviewer({
            name: 'Manohla Dargis',
            company: 'The NY Times'

        });
        return reviewer.validate();
    });

    it('fails validation missing required fields', () => {

        const reviewer = new Reviewer();

        return reviewer.validate()
            .then(
                () => { throw new Error ('Expected validation error'); },
                ({ errors }) => {
                    assert.ok(errors.name);
                }
            );
    });

    it('fails validation with incorrect field type', () => {
        const reviewer = new Reviewer({
            name: {},
        });
        return reviewer.validate()
            .then(
                () => { throw new Error('Expected validation error'); },
                ({ errors }) => {
                    assert.ok(errors.name);
                }
            );
    });
});