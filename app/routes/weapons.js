'use strict';

let generic = require('../../lib/helper/generic'),
    relations = require('../../lib/helper/relations'),
    sequel = require('../../lib/helper/sequel');

module.exports = function(router) {
    const tableName = 'weapon';

    let sql = 'SELECT ' +
        'weapon.id, ' +
        'weapon.user_id, ' +
        'weapon.canon, ' +
        'weapon.name, ' +
        'weapon.description, ' +
        'weapon.weapontype_id, ' +
        'weapon.legal, ' +
        'weapon.price, ' +
        'weapon.damage_dice, ' +
        'weapon.damage_bonus, ' +
        'weapon.critical_dice, ' +
        'weapon.critical_bonus, ' +
        'weapon.hit, ' +
        'weapon.hands, ' +
        'weapon.distance, ' +
        'weapon.created, ' +
        'weapon.updated, ' +
        'weapon.deleted, ' +
        'weapontype.icon, ' +
        'weapontype.attribute_id, ' +
        'weapontype.expertise_id, ' +
        'weapon_is_copy.copy_id, ' +
        'weapon_is_augmentation.augmentation_id, ' +
        'weapon_is_form.form_id, ' +
        'weapon_is_manifestation.manifestation_id, ' +
        'weapon_is_species.species_id, ' +
        'weapon_is_corporation.corporation_id ' +
        'FROM weapon ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapon_is_copy ON weapon_is_copy.weapon_id = weapon.id ' +
        'LEFT JOIN weapon_is_augmentation ON weapon_is_augmentation.weapon_id = weapon.id ' +
        'LEFT JOIN weapon_is_form ON weapon_is_form.weapon_id = weapon.id ' +
        'LEFT JOIN weapon_is_manifestation ON weapon_is_manifestation.weapon_id = weapon.id ' +
        'LEFT JOIN weapon_is_species ON weapon_is_species.weapon_id = weapon.id ' +
        'LEFT JOIN weapon_is_corporation ON weapon_is_corporation.weapon_id = weapon.id';

    generic.root(router, tableName, sql);
    generic.post(router, tableName);
    generic.deleted(router, tableName, sql);
    generic.schema(router, tableName);

    router.route('/augmentation/:augmentationId')
        .get(function(req, res, next) {
            let call = sql + ' WHERE weapon.deleted IS NULL AND ' +
                'augmentation_id = ?';

            sequel.get(req, res, next, call, [req.params.augmentationId]);
        });

    router.route('/form/:formId')
        .get(function(req, res, next) {
            let call = sql + ' WHERE weapon.deleted IS NULL AND ' +
                'form_id = ?';

            sequel.get(req, res, next, call, [req.params.formId]);
        });

    router.route('/manifestation/:manifestationId')
        .get(function(req, res, next) {
            let call = sql + ' WHERE weapon.deleted IS NULL AND ' +
                'manifestation_id = ?';

            sequel.get(req, res, next, call, [req.params.manifestationId]);
        });

    router.route('/species/:speciesId')
        .get(function(req, res, next) {
            let call = sql + ' WHERE weapon.deleted IS NULL AND ' +
                'species_id = ?';

            sequel.get(req, res, next, call, [req.params.speciesId]);
        });

    router.route('/type/:typeId')
        .get(function(req, res, next) {
            let call = sql + ' WHERE weapon.deleted IS NULL AND ' +
                'weapontype_id = ?';

            sequel.get(req, res, next, call, [req.params.typeId]);
        });

    generic.get(router, tableName, sql);
    generic.put(router, tableName);

    generic.automatic(router, tableName);

    // Relations

    relations.route(router, tableName, 'attributes', 'attribute');
    relations.route(router, tableName, 'primals', 'primal');
    relations.route(router, tableName, 'mods', 'weaponmod');
    relations.route(router, tableName, 'skills', 'skill');
};

//todo is_form
//todo is_manifestation