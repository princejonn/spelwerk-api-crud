var async = require('async'),
    _ = require('underscore'),
    chai = require('chai'),
    validator = require('validator');

var should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var app = require('../app'),
    verifier = require('./../verifier'),
    hasher = require('../../lib/hasher');

describe('/backgrounds', function() {

    before(function(done) {
        app.login(done);
    });

    var temporaryId;

    function verifyList(body) {
        assert.isNumber(body.length);

        assert.isArray(body.results);
        assert.lengthOf(body.results, body.length);

        if(body.length > 0) {
            _.each(body.results, function(item) {
                verifyItem(item);
            });
        }

        assert.isObject(body.fields);
    }

    function verifyItem(item) {
        assert.isNumber(item.id);
        assert.isBoolean(item.canon);

        assert.isString(item.name);
        if(item.description) assert.isString(item.description);

        if(item.species_id) assert.isNumber(item.species_id);
        if(item.manifestation_id) assert.isNumber(item.manifestation_id);
        if(item.icon) assert.equal(validator.isURL(item.icon), true);

        assert.isString(item.created);
        if(item.updated) assert.isString(item.updated);
        if(item.deleted) assert.isString(item.deleted);
    }


    describe('POST', function() {

        it('/ should create a new background', function(done) {
            var payload = {
                name: hasher(20),
                description: hasher(20),
                species_id: 1,
                manifestation_id: 1,
                icon: 'http://fakeicon.com/' + hasher(20) + '.png'
            };

            app.post('/backgrounds', payload)
                .expect(201)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.id);

                    temporaryId = res.body.id;

                    done();
                });
        });

        it('/:backgroundId/clone should create a copy of the background', function(done) {
            app.post('/backgrounds/' + temporaryId + '/clone')
                .expect(201)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.id);

                    done();
                });
        });

        it('/:backgroundId/comments should create a new comment for the background', function(done) {
            var payload = {
                content: hasher(20)
            };

            app.post('/backgrounds/' + temporaryId + '/comments', payload)
                .expect(201)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.id);

                    done();
                });
        });

        it('/:backgroundId/assets should add an asset to the background', function(done) {
            var payload = {
                insert_id: 1,
                value: 10
            };

            app.post('/backgrounds/' + temporaryId + '/assets', payload)
                .expect(201)
                .end(done);
        });

        it('/:backgroundId/attributes should add an attribute to the background', function(done) {
            var payload = {
                insert_id: 1,
                value: 10
            };

            app.post('/backgrounds/' + temporaryId + '/attributes', payload)
                .expect(201)
                .end(done);
        });

        it('/:backgroundId/skills should add an skill to the background', function(done) {
            var payload = {
                insert_id: 1,
                value: 10
            };

            app.post('/backgrounds/' + temporaryId + '/skills', payload)
                .expect(201)
                .end(done);
        });

    });

    describe('PUT', function() {

        it('/:backgroundId should update the item with new values', function(done) {
            var payload = {
                name: hasher(20),
                description: hasher(20)
            };

            app.put('/backgrounds/' + temporaryId, payload)
                .expect(204)
                .end(done);
        });

        it('/:backgroundId/canon should update the background canon field', function(done) {
            app.put('/backgrounds/' + temporaryId + '/canon')
                .expect(204)
                .end(done);
        });

        it('/:backgroundId/assets should change the asset value for the background', function(done) {
            var payload = {value: 8};

            app.put('/backgrounds/' + temporaryId + '/assets/1', payload)
                .expect(204)
                .end(done);
        });

        it('/:backgroundId/attributes should change the attribute value for the background', function(done) {
            var payload = {value: 8};

            app.put('/backgrounds/' + temporaryId + '/attributes/1', payload)
                .expect(204)
                .end(done);
        });

        it('/:backgroundId/skills should change the skill value for the background', function(done) {
            var payload = {value: 8};

            app.put('/backgrounds/' + temporaryId + '/skills/1', payload)
                .expect(204)
                .end(done);
        });

    });

    describe('GET', function() {

        it('/ should return a list of backgrounds', function(done) {
            app.get('/backgrounds')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    verifyList(res.body);

                    done();
                });
        });

        it('/species/:typeId should return a list of backgrounds', function(done) {
            app.get('/backgrounds/species/1')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    verifyList(res.body);

                    done();
                });
        });

        it('/manifestation/:typeId should return a list of backgrounds', function(done) {
            app.get('/backgrounds/manifestation/1')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    verifyList(res.body);

                    done();
                });
        });

        it('/:backgroundId should return one background', function(done) {
            app.get('/backgrounds/' + temporaryId)
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    verifyItem(res.body.result);

                    done();
                })
        });

        it('/:backgroundId/ownership should return ownership status of the background if user is logged in', function(done) {
            app.get('/backgrounds/' + temporaryId + '/ownership')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isBoolean(res.body.ownership);

                    done();
                });
        });

        it('/:backgroundId/comments should get all available comments for the background', function(done) {
            app.get('/backgrounds/' + temporaryId + '/comments')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    _.each(res.body.results, function(comment) {
                        assert.isNumber(comment.id);
                        assert.isString(comment.content);

                        assert.isNumber(comment.user_id);
                        assert.isString(comment.displayname);

                        assert.isString(comment.created);
                        if(comment.updated) assert.isString(comment.updated);
                        assert.isNull(comment.deleted);
                    });

                    done();
                })
        });

        it('/:backgroundId/assets should return a list of assets', function(done) {
            app.get('/backgrounds/' + temporaryId + '/assets')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.length);
                    assert.isArray(res.body.results);

                    _.each(res.body.results, function(item) {
                        assert.isNumber(item.background_id);
                        assert.isNumber(item.asset_id);
                        assert.isNumber(item.value);

                        assert.isNumber(item.id);
                        assert.isBoolean(item.canon);
                        assert.isNumber(item.popularity);
                        assert.isString(item.name);
                        assert.isNumber(item.price);
                        assert.isBoolean(item.legal);
                        assert.isNumber(item.assettype_id);

                        assert.isString(item.created);
                        if(item.deleted) assert.isString(item.deleted);
                        if(item.updated) assert.isString(item.updated);
                    });

                    done();
                });
        });

        it('/:backgroundId/attributes should return a list of attributes', function(done) {
            app.get('/backgrounds/' + temporaryId + '/attributes')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.length);
                    assert.isArray(res.body.results);

                    _.each(res.body.results, function(item) {
                        assert.isNumber(item.background_id);
                        assert.isNumber(item.attribute_id);
                        assert.isNumber(item.value);

                        assert.isNumber(item.id);
                        assert.isBoolean(item.canon);
                        assert.isString(item.name);
                        if(item.description) assert.isString(item.description);
                        assert.isNumber(item.attributetype_id);
                        if(item.icon) assert.equal(validator.isURL(item.icon), true);

                        assert.isString(item.created);
                        if(item.deleted) assert.isString(item.deleted);
                        if(item.updated) assert.isString(item.updated);
                    });

                    done();
                });
        });

        it('/:backgroundId/skills should return a list of skills', function(done) {
            app.get('/backgrounds/' + temporaryId + '/skills')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.length);
                    assert.isArray(res.body.results);

                    _.each(res.body.results, function(item) {
                        assert.isNumber(item.background_id);
                        assert.isNumber(item.skill_id);
                        assert.isNumber(item.value);

                        assert.isNumber(item.id);
                        assert.isBoolean(item.canon);
                        assert.isNumber(item.popularity);
                        assert.isBoolean(item.manifestation);
                        assert.isString(item.name);
                        if(item.description) assert.isString(item.description);
                        if(item.species_id) assert.isNumber(item.species_id);
                        if(item.icon) assert.equal(validator.isURL(item.icon), true);

                        assert.isString(item.created);
                        if(item.deleted) assert.isString(item.deleted);
                        if(item.updated) assert.isString(item.updated);
                    });

                    done();
                });
        });

    });

    describe('DELETE', function() {

        it('/:backgroundId/attributes should remove the attribute from the background', function(done) {
            app.delete('/backgrounds/' + temporaryId + '/attributes/1')
                .expect(204)
                .end(done);
        });

        it('/:backgroundId/assets should remove the asset from the background', function(done) {
            app.delete('/backgrounds/' + temporaryId + '/assets/1')
                .expect(204)
                .end(done);
        });

        it('/:backgroundId/skills should remove the skill from the background', function(done) {
            app.delete('/backgrounds/' + temporaryId + '/skills/1')
                .expect(204)
                .end(done);
        });

        it('/:backgroundId should update the background deleted field', function(done) {
            app.delete('/backgrounds/' + temporaryId)
                .expect(204)
                .end(done);
        });

    });

});