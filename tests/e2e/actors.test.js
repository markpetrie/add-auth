const db = require('./helpers/db');
const request = require('./helpers/request');
const assert = require('chai').assert;

describe('actors REST api',() => {
    
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
            .send({name: 'Legendary Pictures'})
            .then(res => res.body)
            .then(savedStudio => studio = savedStudio);
    });
    const peterD = {
        name: 'Peter Dinklage',
        dob: new Date('June 11, 1969')
    };
    const harrsF = {
        name: 'Harrison Ford',
        dob: new Date('July 13, 1942')
    };
    const matthMc = {
        name: 'Matthew McConaughey',
        dob: new Date('November 4, 1969'),
        pob: ' Uvalde, Texas, USA'
    };
    const zoe = {
        name: 'zoeh'
    };
    const zoeS = {
        name: 'Zoe Saldana',
        dob: new Date('June 19, 1978'),
        pob: ' Passaic, New Jersey, USA'

    };
    let intStel = {
        title: 'Interstellar',
        released: new Date('November 5, 2014')
    };
    function saveFilm(film, actor) {
        film.cast = [{actor: actor._id, role:'spaceman'}];
        film.studio = studio._id;
        return request
            .post('/films')
            .set('Authorization', token)
            .send(film)
            .then(res => res.body)
            .then(savedFilm => film = savedFilm);
    }
    function saveActor(actor) {
        return request
            .post('/actors')
            .set('Authorization', token)
            .send(actor)
            .then(({body}) => {
                actor._id = body._id;
                actor.__v = body.__v;
                return body;
            });
    }
    it('saves a actor', () => {
        return saveActor(matthMc)
            .then(savedActor => {
                assert.isOk(savedActor._id);
                assert.equal(savedActor.name, matthMc.name);
                assert.deepEqual(savedActor.dob, matthMc.dob.toISOString());
                return savedActor;
            })
            .then((savedActor) =>{
                saveFilm(intStel,savedActor);
            });
    });
    it('GETs actor if it exists', () => {
        return request
            .get(`/actors/${matthMc._id}`)
            .set('Authorization', token)
            .then(res =>res.body)
            .then(actor => {
                assert.equal(actor.name, matthMc.name);
                assert.equal(actor.dob, matthMc.dob.toISOString());
                assert.equal(actor.pob, matthMc.pob);
                assert.isOk(actor.films); 
                //an extra test that needs to be added once films are added
            });
    });
    it('returns 404 if actor does not exist', () => {
        return request.get('/actors/58ff9f496aafd447254c2666')
            .set('Authorization', token)
            .then(
                () => {
                //resolve
                    throw new Error('successful status code not expected');
                },
                ({ response }) => {
                //reject
                    assert.ok(response.notFound);
                    assert.isOk(response.error);
                }
            );
    });

    it('GET all actors', () => {
        return Promise.all([
            saveActor(harrsF),
            saveActor(peterD),
        ])
            .then(() => request.get('/actors').set('Authorization', token))            
            .then(res => {
                const actors = res.body;
                const tstactors = [matthMc, harrsF, peterD];
                for(let i = 0; i > actors.length; i++) {
                    assert.equal(actors[i].dob,tstactors[i].dob.toISOString());
                    assert.equal(actors[i].name,tstactors[i].name);
                    assert.equal(actors[i].pob,tstactors[i].pob);
                    assert.equal(actors[i]._id,tstactors[i]._id);
                }

            });
    });
    
    it('rewrites actor data by id', () =>{
        saveActor(zoeS)
            .then(() => {
                return request.put(`/actors/${zoeS._id}`)
                    .set('Authorization', token)
                    .send(zoeS)
                    .then(res => {
                        assert.isOk(res.body._id);
                        assert.equal(res.body.name,zoeS.name);
                        assert.equal(res.body.dob,zoeS.dob.toISOString());
                    });
            });
            
    });
    it('deletes actor by id', () => {
        return request.delete(`/actors/${peterD._id}`)
            .set('Authorization', token)
            .then(res => {
                assert.deepEqual(JSON.parse(res.text), {removed: true});
            });
    });
    it('fails to delete the same actor by id', () => {
        return request.delete(`/actors/${peterD._id}`)
            .set('Authorization', token)
            .then(res => {
                assert.deepEqual(JSON.parse(res.text), {removed: false});
            });
    });
    it('fails to delete an actor with a film attached', () => {
        return request.delete(`/actors/${matthMc._id}`)
            .set('Authorization', token)
            .then(res => {
                assert.deepEqual(JSON.parse(res.text),{removed: false});
            },
            err => {
                assert.isOk(err);
            }
            );
    });
});