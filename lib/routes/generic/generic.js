'use strict';

let AppError = require('../../errors/app-error');
let UserNotAdministratorError = require('../../errors/user-not-administrator-error');

let sql = require('../../database/sql');
let elemental = require('../../database/common');

async function select(req, res, next, query, params, single) {
    single = single || false;

    let order_by = typeof req.headers['x-order-by'] !== 'undefined'
        ? JSON.parse(req.headers['x-order-by'])
        : null;

    let pagination_limit = typeof req.headers['x-pagination-limit'] !== 'undefined'
        ? req.headers['x-pagination-limit']
        : null;

    let pagination_amount = typeof req.headers['x-pagination-amount'] !== 'undefined'
        ? req.headers['x-pagination-amount']
        : null;

    if (order_by !== null) {
        query += ' ORDER BY ';

        for (let key in order_by) {
            query += key + ' ' + order_by[key] + ', ';
        }

        query = query.slice(0, -2);
    }

    if (pagination_limit !== null) {
        query += ' LIMIT ' + pagination_limit;
    }

    if (pagination_amount !== null) {
        query += ',' + pagination_amount;
    }

    try {
        let [rows, fields] = await sql(query, params);
        let length = rows ? rows.length : 0;

        if (single && length === 0) {
            return next(new AppError(404, "Not Found", "The requested item could not be found in the database."));
        }

        let data = single
            ? {result: rows[0], fields: fields}
            : {length: length, results: rows, fields: fields};

        res.status(200).send(data);
    } catch(e) { return next(e); }
}

async function insert(req, res, next, tableName) {
    try {
        let id = await elemental.insert(req, req.body, tableName);

        res.status(201).send({id: id});
    } catch(e) { return next(e); }
}

async function update(req, res, next, tableName, tableId) {
    try {
        await elemental.update(req, req.body, tableName, tableId);

        res.status(204).send();
    } catch(e) { return next(e); }
}

async function remove(req, res, next, tableName, tableId) {
    try {
        await elemental.remove(req, tableName, tableId);

        res.status(204).send();
    } catch(e) { return next(e); }
}

async function revive(req, res, next, tableName, tableId) {
    if (!req.user.admin) return next(new UserNotAdministratorError);

    tableId = parseInt(tableId);

    try {
        await sql('UPDATE ' + tableName + ' SET deleted = NULL WHERE id = ?', [tableId]);

        res.status(204).send();
    } catch(e) { return next(e); }
}

async function canon(req, res, next, tableName, tableId, boolean) {
    if (!req.user.admin) return next(new UserNotAdministratorError);

    tableId = parseInt(tableId);
    boolean = boolean || false;

    try {
        await sql('UPDATE ' + tableName + ' SET canon = ?, updated = CURRENT_TIMESTAMP WHERE id = ?', [boolean, tableId]);

        res.status(204).send();
    } catch(e) { return next(e); }
}

async function clone(req, res, next, tableName, tableId) {
    try {
        let id = await elemental.clone(req, tableName, tableId);

        res.status(201).send({id: id});
    } catch(e) { return next(e); }
}

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports.select = select;
module.exports.insert = insert;
module.exports.update = update;
module.exports.remove = remove;
module.exports.revive = revive;
module.exports.canon = canon;
module.exports.clone = clone;
