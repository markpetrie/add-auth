const express = require('express');
const router = express.Router();
const Reviewer = require('../models/reviewer');
const jsonParser = require('body-parser').json();

router

    .get('/', (req, res, next) => {
        Reviewer.find()
            .lean()
            .select('__v name company')
            .then(reviewers => res.send(reviewers))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        Reviewer.bringReviews(req.params.id)
            .then(reviewer => {
                if(!reviewer) res.status(404).send(`Cannot GET ${req.params.id}`);
                else res.send(reviewer);
            })
            .catch(next);
    })

    .use(jsonParser)

    .post('/', (req, res, next) => {
        new Reviewer(req.body)
            .save()
            .then(reviewer => res.send(reviewer))
            .catch(next);
    })

    .put('/:id', (req, res, next) => {
        delete req.body._id;
        Reviewer.findByIdAndUpdate(req.params.id, req.body, {new: true})
            .then(reviewer => res.send(reviewer))
            .catch(next);

    })

    .delete('/:id', (req, res, next) => {
        Reviewer.findByIdAndRemove(req.params.id)
            .then(response => res.send({ removed: !!response }))
            .catch(next);
    });

module.exports = router;