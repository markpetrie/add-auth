
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Film = require('../models/film');

const schema = new Schema({
    
    name:  {
        type: String,
        required: true
    },
    address: {
        city: String,
        state: String,
        zip: String,
        country: String
    },

});
schema.statics.verifyRemove = function(id) {
    return Film.stuExistsFor(id)
        .then(exists => {
            if(exists) {
                throw {
                    code: 400,
                    error: 'Cannot remove studio when they have films'
                };
            }
            else return this.findByIdAndRemove(id);
        });
};
module.exports = mongoose.model('Studio', schema);