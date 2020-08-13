"use strict"; 

const express = require('express');
const { NotFoundError, BadRequestError } = require("../expressError");

const db = require('../db');

const router = new express.Router();

/** We've decided to limit code col in companies database to lower case codes
 * 
 * TODO: change any received 'code' to lowercase before accessing route
 * Trust your users but verify
 */


/** Get information for all companies  */
router.get('/', async function (req, res, next) {
    // console.log('Made it!')
    try {
        const result = await db.query(
            `SELECT code, name
            FROM companies`);
        const companies = result.rows;
        return res.json({ companies });
    }
    catch(err){
        next(err);
    }
})

/** Get information about one company */
router.get('/:code', async function (req, res, next) {
    let code = req.params.code.toLowerCase();
    // console.log('THIS IS THE CODE:', code)
    try {
        const result = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [code]);
        const company = result.rows[0];

        if (!company) throw new NotFoundError(`Not found: ${code}`);

        return res.json({ company });
    }
    catch(err){
        next(err);
    }
})

/** Add a company */
router.post('/', async function (req, res, next) {
    // console.log("running POST companies")
    let {code, name, description} = req.body
    code = code.toLowerCase(); 
    // CODEREVIEW: consider adding tiny helper function for .toLowerCase(); allows for all-or-nothing
    // console.log('{code, name, description}:', code, name, description)
    try {
        const result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, [code, name, description]);
        const company = result.rows[0];

        if (!company) throw new BadRequestError(`Company not added. Please try again`);

        return res.json({ company })
    }
    catch(err){
        next(err);
    }
})
/** Edit existing company.*/
router.put('/:code', async function (req, res, next) {
    // console.log("running PUT companies")
    let code = req.params.code.toLowerCase();
    let {name, description} = req.body
    // console.log("code:", code, "name:", name, "description", description);

    try {
        const result = await db.query(
            `UPDATE companies
            SET name = $2, description = $3
            WHERE code = $1
            RETURNING code, name, description`, [code, name, description]);
        const company = result.rows[0];

        if (!company) throw new NotFoundError(`Not found: ${code}`);

        return res.json({ company })
    }
    catch(err){
        next(err);
    }
})

/**Delete existing company.*/
router.delete('/:code', async function (req, res, next) {
    // console.log("running DElETE companies")
    let code = req.params.code.toLowerCase();
    // console.log("code", code)

    try {
        const result = await db.query(
            `DELETE FROM companies
            WHERE code = $1
            RETURNING code, name, description`, [code]);
            const company = result.rows[0];

        if (!company) throw new NotFoundError(`Not found: ${code}`);

        return res.json({status: "deleted"})
    }
    catch(err){
        next(err);
    }
})

module.exports = router;