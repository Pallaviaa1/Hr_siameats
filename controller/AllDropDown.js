const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

const GetProvinces = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT p.id as id,
            p.code as code,
            p.name_th as name_th,
            p.name_en as name_en,
            p.created_at as created_at
            FROM provinces as p
            ORDER BY p.created_at DESC`,
        )
        return res.status(200).send({
            success: true,
            data: rows
        })
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}

const GetDistrict = async (req, res) => {
    try {
        const { provinces_id } = req.query;
        const [rows, fields] = await db.execute(
            `SELECT d.id as id,
            d.code as code,
            d.name_th as name_th,
            d.name_en as name_en,
            d.created_at as created_at
            FROM district as d
            WHERE d._id='${provinces_id}'
            ORDER BY d.created_at DESC`,
        )
        return res.status(200).send({
            success: true,
            data: rows
        })
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}


const GetSubDistrict = async (req, res) => {
    try {
        const { district_id } = req.query;
        const [rows, fields] = await db.execute(
            `SELECT sd.id as id,
            sd.zipcode as zipcode,
            sd.name_th as name_th,
            sd.name_en as name_en,
            sd.created_at as created_at
            FROM \`sub-district\` as sd
            WHERE sd._id='${district_id}'
            ORDER BY sd.created_at DESC`,
        )
        return res.status(200).send({
            success: true,
            data: rows
        })
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}

const GetEmployee = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT e.id as id,
            e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            e.en_name as en_name,
            e.created_at as created_at
            FROM tb_employee as e`,
        )
        return res.status(200).send({
            success: true,
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}

const GetPayDetailsDrop = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT p.paydetails_id as paydetails_id ,
            p.paydetails_type as paydetails_type,
            p.created_at as created_at
            FROM tb_paydetails as p`,
        )
        return res.status(200).send({
            success: true,
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}

const GetLeaves = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT l.leaves_id as leaves_id,
            l.leaves_type as leaves_type,
            l.created_at as created_at
            FROM tb_leaves as l`,
        )
        return res.status(200).send({
            success: true,
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}

const GetTransactionType = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT t.transaction_id as transaction_id,
            t.transaction_type as transaction_type,
            t.created_at as created_at
            FROM tb_transaction as t`,
        )
        return res.status(200).send({
            success: true,
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}

const GetBonusTransactionsType = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT ts.transactions_id as transactions_id,
            ts.transactions_type as transactions_type,
            ts.created_at as created_at
            FROM tb_transactions as ts`,
        )
        return res.status(200).send({
            success: true,
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}

const GetWorkerType = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT w.worker_id as 	worker_id,
            w.worker_type as worker_type,
            w.created_at as created_at
            FROM tb_worker as w`
        )
        return res.status(200).send({
            success: true,
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}


module.exports = {
    GetProvinces, GetDistrict, GetSubDistrict, GetEmployee, GetPayDetailsDrop, GetLeaves, GetTransactionType, GetBonusTransactionsType,
    GetWorkerType
}
