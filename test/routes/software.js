var async = require('async'),
    _ = require('underscore'),
    chai = require('chai'),
    validator = require('validator');

var should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var app = require('./../app'),
    hasher = require('./../../lib/hasher');

describe('/software', function() {

    before(function(done) {
        app.login(done);
    });

    var temporaryId;

    function verifyGET(body) {
        assert.isNumber(body.length);

        assert.isArray(body.results);
        assert.lengthOf(body.results, body.length);

        if(body.length > 0) {
            _.each(body.results, function(item) {
                assert.isBoolean(item.canon);
                assert.isNumber(item.popularity);

                assert.isString(item.name);
                if(item.description) assert.isString(item.description);
                assert.isNumber(item.price);
                assert.isNumber(item.hacking);
                assert.isNumber(item.hacking_bonus);
                assert.isBoolean(item.legal);

                assert.isString(item.created);
                if(item.updated) assert.isString(item.updated);
                if(item.deleted) assert.isString(item.deleted);
            });
        }

        assert.isObject(body.fields);
    }

    describe('/', function() {

        it('POST / should create a new asset', function(done) {
            var payload = {
                name: hasher(20),
                description: hasher(20),
                price: 10,
                hacking: 10,
                hacking_bonus: 10,
                legal: true
            };

            app.post('/software', payload)
                .expect(201)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.affected);
                    assert.notEqual(res.body.affected, 0);

                    assert.isNumber(res.body.id);

                    temporaryId = res.body.id;

                    done();
                });
        });

        it('GET / should return a list of software', function(done) {
            app.get('/software')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    verifyGET(res.body);

                    done();
                });
        });

    });

    describe('/:softwareId', function() {

        it('GET /:softwareId should return a list with one asset', function(done) {
            app.get('/software/' + temporaryId)
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    verifyGET(res.body);

                    done();
                })
        });

        it('GET /:softwareId/ownership should return ownership status of the asset if user is logged in', function(done) {
            app.get('/software/' + temporaryId + '/ownership')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isBoolean(res.body.ownership);

                    done();
                });
        });

        it('PUT /:softwareId should update the item with new values', function(done) {
            var payload = {
                name: hasher(20),
                description: hasher(20),
                price: 8,
                hacking: 8,
                hacking_bonus: 8,
                legal: false
            };

            app.put('/software/' + temporaryId, payload)
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.changed);
                    assert.notEqual(res.body.changed, 0);

                    assert.isNumber(res.body.id);

                    done();
                })
        });

        it('PUT /:softwareId/canon should update the asset canon field', function(done) {
            app.put('/software/' + temporaryId + '/canon')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.changed);
                    assert.notEqual(res.body.changed, 0);

                    assert.isNumber(res.body.id);

                    done();
                });
        });

    });

    describe('/:softwareId/comments', function() {

        it('POST /:softwareId/comments should create a new comment for the asset', function(done) {
            var payload = {
                content: hasher(20)
            };

            app.post('/software/' + temporaryId + '/comments', payload)
                .expect(201)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.affected);
                    assert.isNumber(res.body.id);

                    done();
                });
        });

        it('GET /:softwareId/comments should get all available comments for the asset', function(done) {
            app.get('/software/' + temporaryId + '/comments')
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

    });

    describe('END', function() {

        it('POST /:softwareId/clone should create a copy of the asset', function(done) {
            app.post('/software/' + temporaryId + '/clone')
                .expect(201)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.affected);
                    assert.isNumber(res.body.id);

                    done();
                });
        });

        it('DELETE /:softwareId should update the asset deleted field', function(done) {
            app.delete('/software/' + temporaryId)
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);

                    assert.isNumber(res.body.affected);
                    assert.notEqual(res.body.affected, 0);

                    done();
                })
        });

    });

});