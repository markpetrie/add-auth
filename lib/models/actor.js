const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Film = require('../models/film');

const actSche = new Schema({
    name:{
        type: String,
        required:true
    },
    dob:{
        type: Date
    },
    pob:{
        type: String
    }
},{
    timestamps: true
});
actSche.statics.verifyRemove = function(id) {
    return Film.actExistsFor(id)
        .then(exists => {
            if(exists) {
                throw {
                    code: 400,
                    error: 'Cannot remove actor when they have films'
                };
            }
            else return this.findByIdAndRemove(id);
        });
};
actSche.statics.bringFilms = function(id) {
    return Promise.all([
        this.findById(id)
            .lean(),
        Film.find({'cast.actor': id})
            .select('title released')
            .lean()
    ])
        .then(([actor,films]) => {
            if(actor) {
                actor.films = films;
            }
            return actor;
        });

};

module.exports = mongoose.model('Actor', actSche);