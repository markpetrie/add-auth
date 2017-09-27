
const express = require('express');
const router = express.Router();
const Studio = require('../models/studio');
const jsonParser = require('body-parser').json();

router

    .get('/', (req, res, next) => {
        Studio.find()
            .lean()
            .select('__v name address')
            .then(studios => res.send(studios))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        Studio.findById(req.params.id)
            .lean()
            .populate({
                path: 'studio',
                select: '__v name'
            })
            .populate({
                path: 'film',
                select: 'title'
            })
            .then(studios => res.send(studios))
            .catch(next);
    })

    .use(jsonParser)

    .post('/', (req, res, next) => {
        new Studio(req.body)
            .save()
            .then(studio => res.send(studio))
            .catch(next);
    })

    .put('/:id', (req, res, next) => {
        delete req.body._id;
        Studio.findByIdAndUpdate(req.params.id, req.body, {new: true})
            .then(studio => res.send(studio))
            .catch(next);

    })

    .delete('/:id', (req, res, next) => {
        Studio.verifyRemove(req.params.id)
            .then(response => res.send({ removed: !!response }))
            .catch(next);
    });

module.exports = router;