const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

const GetAllbonusAndDeduction = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT bd.id as bonusDeduction_id,
            bd.employee_id as employee_id,
            bd.transactions_date as transactions_date,
            bd.amount as amount,
            bd.transactions_id as transactions_id,
            bd.reason as reason,
            bd.created_at as created_at,
            bd.is_deleted as is_deleted,
            e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            t.transactions_type as transactions_type
            FROM tb_bonusanddeduction as bd
            LEFT JOIN tb_employee as e ON e.id=bd.employee_id
            LEFT JOIN tb_transactions as t ON t.transactions_id =bd.transactions_id
            WHERE bd.is_deleted='${0}'
            ORDER BY bd.created_at DESC`,
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

const AddbonusDeduction = async (req, res) => {
    try {
        const { employee_id, transactions_date, amount, transactions_id, reason } = req.body;


        const [rows, fields] = await db.execute(
            `INSERT into tb_bonusanddeduction (employee_id, transactions_date, amount, transactions_id, reason ) values (?,?,?,?,?)`,
            [employee_id, transactions_date, amount, transactions_id, reason])

        return res.status(200).send({
            success: true,
            message: "Bonus and Deduction Added Successfully",
            data: rows
        })

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}

const UpdatebonusDeduction = async (req, res) => {
    try {
        const {
            bonusDeduction_id, employee_id, transactions_date, amount, transactions_id, reason
        } = req.body;

        // Check if the record exists
        const [existingRecord] = await db.execute(
            `SELECT id FROM tb_bonusanddeduction WHERE id =?`,
            [bonusDeduction_id]
        );

        if (existingRecord.length > 0) {
            // Update the existing record
            await db.execute(
                `UPDATE tb_bonusanddeduction SET 
                   employee_id=?, transactions_date=?, amount=?, transactions_id=?, reason=?
                WHERE id = ?`,
                [
                    employee_id, transactions_date, amount, transactions_id, reason, bonusDeduction_id
                ]
            );

            return res.status(200).send({
                success: true,
                message: "Bonus and Deduction updated successfully."
            });
        } else {
            // Record not found
            return res.status(400).send({
                success: false,
                message: "Bonus and Deduction record not found."
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};

const GetbonusDeductionById = async (req, res) => {
    try {
        const { bonusDeduction_id } = req.body
        const [rows, fields] = await db.execute(
            `SELECT bd.id as bonusDeduction_id,
            bd.employee_id as employee_id,
            bd.transactions_date as transactions_date,
            bd.amount as amount,
            bd.transactions_id as transactions_id,
            bd.reason as reason,
            bd.created_at as created_at,
            bd.is_deleted as is_deleted,
            e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            t.transactions_type as transactions_type
            FROM tb_bonusanddeduction as bd
            LEFT JOIN tb_employee as e ON e.id=bd.employee_id
            LEFT JOIN tb_transactions as t ON t.transactions_id =bd.transactions_id
            WHERE bd.is_deleted='${0}' and bd.id='${bonusDeduction_id}'`,
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
                message: "Bonus and Deduction record not found."
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}

const DeletebonusDeduction = async (req, res) => {
    try {
        const { bonusDeduction_id } = req.body;

        // Check if the employee exists
        const [existingEmployee] = await db.execute(
            `SELECT * FROM tb_bonusanddeduction WHERE id = ? and is_deleted=?`,
            [bonusDeduction_id, 0]
        );

        if (existingEmployee.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Bonus and Deduction not found."
            });
        }

        // Delete the employee
        const [rows] = await db.execute(
            `Update tb_bonusanddeduction SET is_deleted=? WHERE id = ?`,
            [1, bonusDeduction_id]
        );

        return res.status(200).send({
            success: true,
            message: "Bonus and Deduction Deleted Successfully",
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};


module.exports = { GetAllbonusAndDeduction, AddbonusDeduction, UpdatebonusDeduction, GetbonusDeductionById, DeletebonusDeduction }
