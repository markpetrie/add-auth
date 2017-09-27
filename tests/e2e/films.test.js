const db = require('./helpers/db');
const request = require('./helpers/request');
const assert = require('chai').assert;

describe('films REST api', () => {
    before(db.drop);

    let token = null;
    before(() => {
        return db.getToken()
            .then(t => token = t);
    });

    let studio = null;
    before(() => {
        return request.post('/studios')
            .set('Authorization', token)
            .send({name: 'universal studios'})
            .then(res => res.body)
            .then(savedStudio => studio = savedStudio);
    });
    let actor = null;
    before(()=>{
        return request.post('/actors')
            .set('Authorization', token)
            .send({name: 'Sam Neill'})
            .then(res => res.body)
            .then(savedActor => actor = savedActor);
    });

    let jurassP = {
        title: 'jurassic park',
        released: new Date('11 June 1993')
    }; 
    let jaw = {
        title: 'jaws',
        released: new Date('June 20, 1975')
    };
    let et = {
        title: 'E.T.',
        released: new Date('May 26, 1982')
    };
    let bruAlm = {
        title: 'Bruce Almighty',
        released: new Date('May 23, 2003')
    };
    let bru = {
        title: 'bruse Almity',
        released: new Date('July 23, 2011')
    };

    function saveFilm(film) {
        film.cast = [{actor: actor._id, role:'Grant'}];
        film.studio = studio._id;
        return request
            .post('/films')
            .set('Authorization', token)
            .send(film)
            .then(res => res.body);
    }
    
    it('roundtrip gets a new film', () => {
        return saveFilm(jurassP)
            .then(saved => {
                assert.ok(saved._id, 'saved has ID');
                jurassP = saved;
            })
            .then(() => {
                return request.get(`/films/${jurassP._id}`)
                    .set('Authorization', token);
            })
            .then(res => res.body)
            .then(got => {
                assert.deepEqual(got, jurassP);
            });
    });
    it('returns 404 if film does not exist', () => {
        return request.get('/films/58ff9f496aafd447254c2666')
            .set('Authorization', token)
            .then(
                () => {
                    throw new Error('successful status code not expected');
                },
                ({ response }) => {
                    assert.ok(response.notFound);
                    assert.isOk(response.error);
                }
            );
    });
    it('GET all films', () => {
        return Promise.all([
            saveFilm(jaw),
            saveFilm(et)
        ])
            .then(() => request.get('/films')
                .set('Authorization', token))
            .then(res => {
                const films = res.body;
                const tstfilms = [jurassP, jaw, et];
                for(let i = 0; i > films.length; i++) {
                    assert.equal(films[i].released,tstfilms[i].released.toISOString());
                    assert.equal(films[i].title,tstfilms[i].title);
                    assert.equal(films[i]._id,tstfilms[i]._id);
                    assert.isOk(films[i].studio);
                }

            });
    });
    it('rewrites film data by id', () =>{
        return saveFilm(bru)
            .then((saved)=> {
                return request
                    .put(`/films/${saved._id}`)
                    .set('Authorization', token)
                    .send(bruAlm);
            })
            .then(res => {
                assert.isOk(res.body._id);
                assert.equal(res.body.title,bruAlm.title);
                assert.equal(res.body.released,bruAlm.released.toISOString());
            });
    });
    it('deletes film by id', () => {
        return request.delete(`/films/${jurassP._id}`)
            .set('Authorization', token)
            .then(res => {
                assert.deepEqual(JSON.parse(res.text), {removed: true});
            });
    });
    it('deletes film by id', () => {
        return request.delete(`/films/${jurassP._id}`)
            .set('Authorization', token)
            .then(res => {
                assert.deepEqual(JSON.parse(res.text), {removed: false});
            });
    });

});