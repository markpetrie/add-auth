const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const filSche = new Schema({
    title: {
        type: String,
        required: true
    },
    released: {
        type: Date,
        required: true
    },
    studio: {
        type: Schema.Types.ObjectId,
        ref: 'Studio',
        required: true
    },
    
    cast: [{
        actor: {
            type: Schema.Types.ObjectId,
            ref: 'Actor',
            required: true
        },
        role: {
            type: String
        }
    }]
});
filSche.statics.actExistsFor = function(actorId) {
    return this.find({'cast.actor': actorId})
        .count()
        .then(count => count > 0);
};
filSche.statics.stuExistsFor = function(stuId) {
    return this.find({'cast.actor': stuId})
        .count()
        .then(count => count > 0);
};
//static funtion may be needed to prevent actors from beeing deleted when 
//they have a film they were in still in the database

module.exports = mongoose.model('Film', filSche);