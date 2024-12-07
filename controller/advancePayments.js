const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

const GetAllAdvancePayments = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT ad.id as advancePayment_id,
            ad.transaction_date as transaction_date,
            ad.amount as amount,
            ad.employee_id as employee_id,
            ad.transaction_id as transaction_id,
            ad.number_of_months as number_of_months,
            ad.created_at as created_at,
            ad.is_deleted as is_deleted,
            e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            t.transaction_type as transaction_type
            FROM tb_advancepayments as ad
            LEFT JOIN tb_employee as e ON e.id=ad.employee_id
            LEFT JOIN tb_transaction as t ON t.transaction_id =ad.transaction_id
            WHERE ad.is_deleted='${0}'
            ORDER BY ad.created_at DESC`,
        )
        res.status(200).send({
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

const AddAdvancePayment = async (req, res) => {
    try {
        const { employee_id, transaction_date, transaction_id, amount } = req.body;

        const [rows, fields] = await db.execute(
            `INSERT into tb_advancepayments (employee_id, transaction_date, transaction_id, amount ) values (?,?,?,?)`,
            [employee_id, transaction_date, transaction_id, amount])

        return res.status(200).send({
            success: true,
            message: "AdvancePayment Added Successfully",
            data: rows
        })

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}

const UpdateAdvancePayment = async (req, res) => {
    try {
        const {
            advancePayment_id, employee_id, transaction_date, transaction_id, amount
        } = req.body;

        // Check if the record exists
        const [existingRecord] = await db.execute(
            `SELECT id FROM tb_advancepayments WHERE id =?`,
            [advancePayment_id]
        );

        if (existingRecord.length > 0) {
            // Update the existing record
            await db.execute(
                `UPDATE tb_advancepayments SET 
                   employee_id=?, transaction_date=?, transaction_id=?, amount=?
                WHERE id = ?`,
                [
                    employee_id, transaction_date, transaction_id, amount, advancePayment_id
                ]
            );

            return res.status(200).send({
                success: true,
                message: "AdvancePayment updated successfully."
            });
        } else {
            // Record not found
            return res.status(400).send({
                success: false,
                message: "AdvancePayment record not found."
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};

const GetAdvancePaymentById = async (req, res) => {
    try {
        const { AdvancePayment_id } = req.body
        const [rows, fields] = await db.execute(
            `SELECT ad.id as advancePayment_id,
            ad.transaction_date as transaction_date,
            ad.amount as amount,
            ad.employee_id as employee_id,
            ad.transaction_id as transaction_id,
            ad.number_of_months as number_of_months,
            ad.created_at as created_at,
            ad.is_deleted as is_deleted,
            e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            t.transaction_type as transaction_type
            FROM tb_advancepayments as ad
            LEFT JOIN tb_employee as e ON e.id=ad.employee_id
            LEFT JOIN tb_transaction as t ON t.transaction_id =ad.transaction_id
            WHERE ad.is_deleted='${0}' and ad.id='${AdvancePayment_id}'`,
        )
        if (rows.length > 0) {
            return res.status(200).send({
                success: true,
                data: rows[0]
            })
        }
        else {
            return res.status(400).send({
                success: false,
                message: "AdvancePayment record not found."
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}

const DeleteAdvancePayment = async (req, res) => {
    try {
        const { AdvancePayment_id } = req.body;

        // Check if the employee exists
        const [existingEmployee] = await db.execute(
            `SELECT * FROM tb_advancepayments WHERE id = ? and is_deleted=?`,
            [AdvancePayment_id, 0]
        );

        if (existingEmployee.length === 0) {
            return res.status(400).send({
                success: false,
                message: "AdvancePayment not found."
            });
        }

        // Delete the employee
        const [rows] = await db.execute(
            `Update tb_advancepayments SET is_deleted=? WHERE id = ?`,
            [1, AdvancePayment_id]
        );

        return res.status(200).send({
            success: true,
            message: "AdvancePayment Deleted Successfully",
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};


module.exports = { GetAllAdvancePayments, AddAdvancePayment, UpdateAdvancePayment, GetAdvancePaymentById, DeleteAdvancePayment }
