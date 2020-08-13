"use strict"; 

const express = require('express');
const { NotFoundError, BadRequestError } = require("../expressError");

const db = require('../db');

const router = new express.Router();

/** Get information for all invoices */
router.get('/', async function (req, res, next) {
    console.log('Show all Invoices Route')
    try {
        const result = await db.query(
            `SELECT id, comp_code
            FROM invoices`);
        const invoices = result.rows;
        return res.json({ invoices });
    }
    catch(err){
        next(err);
    }
})

/** Show information on a specific invoice, including company info */
router.get('/:id', async function (req, res, next) {
    console.log('Route to show specific invoice')
    try {
        const id = req.params.id;
        const iResult = await db.query(
            `SELECT id, amt, paid, add_date, paid_date, comp_code AS company
            FROM invoices
            WHERE id = $1`, [id]);
        const invoice = iResult.rows[0]
        // console.log('THE INVOICE IS:', invoice)
        if (!invoice) throw new NotFoundError(`Not found: ${id}`);

        const cResult = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [invoice.company]);
        const company = cResult.rows[0];
        invoice.company = company;
        // console.log('THE COMPANY IS:', company)

        return res.json({ invoice });
    }
    catch(err){
        next(err);
    }
})

/** Show information on a specific invoice, including company info */
router.post('/', async function (req, res, next) {
    console.log('Route to post a new invoice')
    try {
        const {comp_code, amt} = req.body
        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]);
        const invoice = result.rows[0]

        if (!invoice) throw new BadRequestError(`Invoice not added. Please try again`);
        
        return res.json({ invoice })
    }
    catch(err){
        next(err);
    }
})

/** Edit existing invoice.*/
router.put('/:id', async function (req, res, next) {
    console.log("running PUT invoices")
    const id = req.params.id;
    const {amt} = req.body;
    console.log("id:", id, "amt:", amt);

    try {
        const result = await db.query(
            `UPDATE invoices
            SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);
        const invoice = result.rows[0];

        if (!invoice) throw new NotFoundError(`Not found: ${id}`);

        return res.json({ invoice })
    }
    catch (err) {
        next(err);
    }
})

/**Delete existing invoice.*/
router.delete('/:id', async function (req, res, next) {
    console.log("running DElETE companies")
    const id = req.params.id;
    console.log("id", id)

    try {
        const result = await db.query(
            `DELETE FROM invoices
            WHERE id = $1
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [id]);
        const invoice = result.rows[0];

        if (!invoice) throw new NotFoundError(`Not found: invoice ${id}`);

        return res.json({ status: "deleted" })
    }
    catch (err) {
        next(err);
    }
})

module.exports = router;