var async = require('async'),
    _ = require('underscore'),
    chai = require('chai'),
    validator = require('validator');

var should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var app = require('../app'),
    verifier = require('../verifier'),
    hasher = require('../../lib/hasher');

describe('/augmentations', function() {

    var baseRoute = '/augmentations';

    var temporaryId,
        attributeId,
        expertiseId,
        skillId,
        softwareId;

    before(function(done) {
        app.login(done);
    });

    before(function(done) {
        app.get('/attributes')
            .expect(200)
            .end(function(err, res) {
                if(err) return done(err);

                attributeId = res.body.results[0].id;

                done();
            });
    });

    before(function(done) {
        app.get('/expertises')
            .expect(200)
            .end(function(err, res) {
                if(err) return done(err);

                expertiseId = res.body.results[0].id;

                done();
            });
    });

    before(function(done) {
        app.get('/skills')
            .expect(200)
            .end(function(err, res) {
                if(err) return done(err);

                skillId = res.body.results[0].id;

                done();
            });
    });

    before(function(done) {
        app.get('/software')
            .expect(200)
            .end(function(err, res) {
                if(err) return done(err);

                softwareId = res.body.results[0].id;

                done();
            });
    });

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
        verifier.generic(item);

        assert.isBoolean(item.legal);
        assert.isNumber(item.price);
        assert.isNumber(item.hacking);
    }


    describe('POST', function() {

        it('/ should create a new augmentation', function(done) {
            var payload = {
                name: hasher(20),
                description: hasher(20),
                legal: true,
                price: 10,
                hacking: 10
            };

            app.post(baseRoute, payload)
                .expect(201)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.id);

                    temporaryId = res.body.id;

                    done();
                });
        });

        it('/:id/clone should create a copy', function(done) {
            app.post(baseRoute + '/' + temporaryId + '/clone')
                .expect(201)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.id);

                    done();
                });
        });

        it('/:id/comments should create a new comment', function(done) {
            app.post(baseRoute + '/' + temporaryId + '/comments', { comment: hasher(20) })
                .expect(201)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.id);

                    done();
                });
        });

        it('/:id/attributes should add an attribute', function(done) {
            var payload = {
                insert_id: attributeId,
                value: 10
            };

            app.post(baseRoute + '/' + temporaryId + '/attributes', payload)
                .expect(201)
                .end(done);
        });

        it('/:id/expertises should add an expertise', function(done) {
            var payload = {
                insert_id: expertiseId,
                value: 10
            };

            app.post(baseRoute + '/' + temporaryId + '/expertises', payload)
                .expect(201)
                .end(done);
        });

        it('/:id/skills should add a skill', function(done) {
            var payload = {
                insert_id: skillId,
                value: 10
            };

            app.post(baseRoute + '/' + temporaryId + '/skills', payload)
                .expect(201)
                .end(done);
        });

        it('/:id/software should add an software to the augmentation', function(done) {
            var payload = {
                insert_id: softwareId
            };

            app.post(baseRoute + '/' + temporaryId + '/software', payload)
                .expect(201)
                .end(done);
        });

    });

    describe('PUT', function() {

        it('/:id should update the item with new values', function(done) {
            var payload = {
                name: hasher(20),
                description: hasher(20)
            };

            app.put(baseRoute + '/' + temporaryId, payload)
                .expect(204)
                .end(done);
        });

        it('/:id/canon should update the canon status', function(done) {
            app.put(baseRoute + '/' + temporaryId + '/canon/1')
                .expect(204)
                .end(done);
        });

        it('/:id/attributes should change the value', function(done) {
            app.put(baseRoute + '/' + temporaryId + '/attributes/' + attributeId, {value: 8})
                .expect(204)
                .end(done);
        });

        it('/:id/expertises should change the value', function(done) {
            app.put(baseRoute + '/' + temporaryId + '/expertises/' + expertiseId, {value: 8})
                .expect(204)
                .end(done);
        });

        it('/:id/skills should change the value', function(done) {
            app.put(baseRoute + '/' + temporaryId + '/skills/' + skillId, {value: 8})
                .expect(204)
                .end(done);
        });

    });

    describe('GET', function() {

        it('/ should return a list of augmentations', function(done) {
            app.get(baseRoute)
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    verifyList(res.body);

                    done();
                });
        });

        it('/:id should return one item', function(done) {
            app.get(baseRoute + '/' + temporaryId)
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    verifyItem(res.body.result);

                    done();
                })
        });

        it('/:id/ownership should return ownership', function(done) {
            app.get(baseRoute + '/' + temporaryId + '/ownership')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isBoolean(res.body.ownership);

                    done();
                });
        });

        it('/:id/comments should get all available comments', function(done) {
            app.get(baseRoute + '/' + temporaryId + '/comments')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    verifier.comments(res.body.results);

                    done();
                })
        });

        it('/:id/attributes should return a list', function(done) {
            app.get(baseRoute + '/' + temporaryId + '/attributes')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.length);
                    assert.isArray(res.body.results);

                    _.each(res.body.results, function(item) {
                        verifier.generic(item)
                    });

                    done();
                });
        });

        it('/:id/expertises should return a list', function(done) {
            app.get(baseRoute + '/' + temporaryId + '/expertises')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.length);
                    assert.isArray(res.body.results);

                    _.each(res.body.results, function(item) {
                        verifier.generic(item)
                    });

                    done();
                });
        });

        it('/:id/skills should return a list', function(done) {
            app.get(baseRoute + '/' + temporaryId + '/skills')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.length);
                    assert.isArray(res.body.results);

                    _.each(res.body.results, function(item) {
                        verifier.generic(item)
                    });

                    done();
                });
        });

        it('/:id/software should return a list of software', function(done) {
            app.get(baseRoute + '/' + temporaryId + '/software')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.length);
                    assert.isArray(res.body.results);

                    _.each(res.body.results, function(item) {
                        verifier.generic(item);
                    });

                    done();
                });
        });

    });

    xdescribe('DELETE', function() {

        it('/:id/attributes should remove the attribute from the augmentation', function(done) {
            app.delete(baseRoute + '/' + temporaryId + '/attributes/1')
                .expect(204)
                .end(done);
        });

        it('/:id/skills should remove the skill from the augmentation', function(done) {
            app.delete(baseRoute + '/' + temporaryId + '/skills/1')
                .expect(204)
                .end(done);
        });

        it('/:id should update the augmentation deleted field', function(done) {
            app.delete(baseRoute + '/' + temporaryId)
                .expect(204)
                .end(done);
        });

    });

});