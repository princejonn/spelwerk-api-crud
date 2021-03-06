'use strict';

const yaml = require('node-yaml').readSync;
const attributes = yaml('../../config/attributes.yml');
const defaults = yaml('../../config/defaults.yml');
const dice = yaml('../../config/dice.yml');
const icons = yaml('../../config/icons.yml');
const plural = yaml('../../config/plural.yml');
const points = yaml('../../config/points.yml');

const schema = require('../../app/initializers/database').getDbSchema();

module.exports = (router) => {
    router.route('/')
        .get((req, res) => {
            res.status(204).send({success: true});
        });

    router.route('/config')
        .get((req, res) => {
            res.status(200).send({
                attributes: attributes,
                defaults: defaults,
                dice: dice,
                icons: icons,
                plural: plural,
                points: points
            });
        });

    router.route('/config/attributes')
        .get((req, res) => {
            res.status(200).send(attributes);
        });

    router.route('/config/defaults')
        .get((req, res) => {
            res.status(200).send(defaults);
        });

    router.route('/config/dice')
        .get((req, res) => {
            res.status(200).send(dice);
        });

    router.route('/config/icons')
        .get((req, res) => {
            res.status(200).send(icons);
        });

    router.route('/config/plural')
        .get((req, res) => {
            res.status(200).send(plural);
        });

    router.route('/config/points')
        .get((req, res) => {
            res.status(200).send(points);
        });

    router.route('/schema')
        .get((req, res) => {
            res.status(200).send(schema);
        })
};
