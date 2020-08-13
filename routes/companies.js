const express = require('express');
const { NotFoundError } = require("../expressError");

const db = require('../db');

const router = new express.Router();

router.get('/', async function (req, res, next) {
    // console.log('Made it!')
    try {
        const result = await db.query(
            `SELECT code, name
            FROM companies`);
        const companies = result.rows
        return res.json({ companies })
    }
    catch(err){
        next(err);
    }
})

router.get('/:code', async function (req, res, next) {
    let code = req.params.code
    console.log('THIS IS THE CODE:', code)
    try {
        const result = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [code]);
            const company = result.rows[0];
            return res.json({ company })
    }
    catch(err){
        next(err);
    }
})



module.exports = router;