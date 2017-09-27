const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('../models/review');


const schema = new Schema({
    
    name:  {
        type: String,
        required: true
    },
    
    company: {
        type: String,
        required: true
    }

});

schema.statics.bringReviews = function(id) {
    return Promise.all([
        this.findById(id)
            .lean(),
        Review.find({'reviewer': id})
            .select('film.title rating review')
            .lean()
    ])
        .then(([reviewer, reviews]) => {
            if(reviewer) reviewer.reviews = reviews;
            return reviewer;
        });

};

module.exports = mongoose.model('Reviewer', schema);