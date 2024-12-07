const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

const GetAllVacations = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT v.id as vacation_id,
            v.employee_id as employee_id,
            v.leaves_id as leaves_id,
            v.start_date as start_date,
            v.end_date as end_date,
            v.days as days,
            v.sort as sort,
            v.is_deleted as is_deleted,
            v.created_at as created_at,
            e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            l.leaves_type  as leaves_type
            FROM tb_vacation as v
            LEFT JOIN tb_employee as e ON e.id=v.employee_id
            LEFT JOIN tb_leaves as l ON l.leaves_id =v.leaves_id
            WHERE v.is_deleted='${0}'
            ORDER BY v.created_at DESC`,
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

const AddVacation = async (req, res) => {
    try {
        const { employee_id, leaves_id, start_date, end_date, days } = req.body;

        const [rows, fields] = await db.execute(
            `INSERT into tb_vacation (employee_id, leaves_id, start_date, end_date, days ) values (?,?,?,?,?)`,
            [employee_id, leaves_id, start_date, end_date, days])

        return res.status(200).send({
            success: true,
            message: "Vacation Added Successfully",
            data: rows
        })

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}


const UpdateVacation = async (req, res) => {
    try {
        const {
            vacation_id, employee_id, leaves_id, start_date, end_date, days
        } = req.body;

        // Check if the record exists
        const [existingRecord] = await db.execute(
            `SELECT id FROM tb_vacation WHERE id =?`,
            [vacation_id]
        );

        if (existingRecord.length > 0) {
            // Update the existing record
            await db.execute(
                `UPDATE tb_vacation SET 
                   employee_id=?, leaves_id=?, start_date=?, end_date=?, days=?
                WHERE id = ?`,
                [
                    employee_id, leaves_id, start_date, end_date, days, vacation_id
                ]
            );

            return res.status(200).send({
                success: true,
                message: "Vacation updated successfully."
            });
        } else {
            // Record not found
            return res.status(400).send({
                success: false,
                message: "Vacation record not found."
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};

const GetVacationById = async (req, res) => {
    try {
        const { vacation_id } = req.body
        const [rows, fields] = await db.execute(
            `SELECT v.id as vacation_id,
            v.employee_id as employee_id,
            v.leaves_id as leaves_id,
            v.start_date as start_date,
            v.end_date as end_date,
            v.days as days,
            v.sort as sort,
            v.is_deleted as is_deleted,
            v.created_at as created_at,
            e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            l.leaves_type  as leaves_type
            FROM tb_vacation as v
            LEFT JOIN tb_employee as e ON e.id=v.employee_id
            LEFT JOIN tb_leaves as l ON l.leaves_id =v.leaves_id
            WHERE v.is_deleted='${0}' and v.id='${vacation_id}'`,
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
                message: "Salary record not found."
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}

const DeleteVacation = async (req, res) => {
    try {
        const { vacation_id } = req.body;

        // Check if the employee exists
        const [existingEmployee] = await db.execute(
            `SELECT * FROM tb_vacation WHERE id = ? and is_deleted=?`,
            [vacation_id, 0]
        );

        if (existingEmployee.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Vacation not found."
            });
        }

        // Delete the employee
        const [rows] = await db.execute(
            `Update tb_vacation SET is_deleted=? WHERE id = ?`,
            [1, vacation_id]
        );

        return res.status(200).send({
            success: true,
            message: "Vacation Deleted Successfully",
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};


module.exports = { GetAllVacations, AddVacation, UpdateVacation, GetVacationById, DeleteVacation }
