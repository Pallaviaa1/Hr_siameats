const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

const GetAllEmployee = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT e.id as employee_id,
            e.f_name as f_name,
            e.l_name as l_name,
            e.status as employee_status,
            e.sort as sort,
            e.thai_id as thai_id,
            e.n_name as n_name,
            e.en_name as en_name,
            e.birthdate as birthdate,
            e.address as address,
            e.sub_district as sub_district,
            e.district as district,
            e.province as province,
            e.code as code,
            e.phone_number as phone_number,
            e.line_id as line_id,
            e.photo_file as photo_file,
            e.probation as probation,
            e.worker_id as worker_id,
            e.employee_startdate as employee_startdate,
            e.province as province,
            e.banknum as banknum,
            e.bankname as bankname,
            e.annual_date as annual_date,
            e.sick_date as sick_date,
            e.annual_date as created_at,
            e.sick_date as update_at,
            e.is_deleted as is_deleted
            FROM tb_employee as e
            WHERE e.is_deleted='${0}'`,
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

const CreateEmployee = async (req, res) => {
    try {
        const { card_number, name, surname, nickname, nickname_en, dob, address, province, district, sub_district,
            zip_code, telephone_number, line_id, Work_start_date, probation_period, bank_account_number, bank_name } = req.body;

        const [rows, fields] = await db.execute(
            `INSERT into tb_employee (thai_id, f_name, l_name, n_name, en_name, birthdate, address, province, district, sub_district, code, phone_number, line_id, employee_startdate, probation, banknum, bankname ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [card_number, name, surname, nickname, nickname_en, dob, address, province, district, sub_district,
                zip_code, telephone_number, line_id, Work_start_date, probation_period, bank_account_number, bank_name])

        if (req.file) {
            const [row, field] = await db.execute(
                `UPDATE tb_employee set photo_file='${req.file.filename}' where id='${rows.insertId}'`)
        }
        return res.status(200).send({
            success: true,
            message: "Employee Added Successfully",
            data: rows
        })
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}

const UpdateEmployee = async (req, res) => {
    try {
        const {
            employee_id,
            card_number,
            name,
            surname,
            nickname,
            nickname_en,
            dob,
            address,
            province,
            district,
            sub_district,
            zip_code,
            telephone_number,
            line_id,
            Work_start_date,
            probation_period,
            bank_account_number,
            bank_name
        } = req.body;

        // Check if the employee exists
        const [existingEmployee] = await db.execute(
            `SELECT * FROM tb_employee WHERE id = ?`,
            [employee_id]
        );

        if (existingEmployee.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Employee not found."
            });
        }

        // Update the employee details
        const [rows] = await db.execute(
            `UPDATE tb_employee SET 
                thai_id = ?, 
                f_name = ?, 
                l_name = ?, 
                n_name = ?, 
                en_name = ?, 
                birthdate = ?, 
                address = ?, 
                province = ?, 
                district = ?, 
                sub_district = ?, 
                code = ?, 
                phone_number = ?, 
                line_id = ?, 
                employee_startdate = ?, 
                probation = ?, 
                banknum = ?, 
                bankname = ? 
            WHERE id = ?`,
            [
                card_number,
                name,
                surname,
                nickname,
                nickname_en,
                dob,
                address,
                province,
                district,
                sub_district,
                zip_code,
                telephone_number,
                line_id,
                Work_start_date,
                probation_period,
                bank_account_number,
                bank_name,
                employee_id
            ]
        );

        // If a file is uploaded, update the photo
        if (req.file) {
            await db.execute(
                `UPDATE tb_employee SET photo_file = ? WHERE id = ?`,
                [req.file.filename, employee_id]
            );
        }

        return res.status(200).send({
            success: true,
            message: "Employee Updated Successfully",
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

const DeleteEmployee = async (req, res) => {
    try {
        const { employee_id } = req.body;

        // Check if the employee exists
        const [existingEmployee] = await db.execute(
            `SELECT * FROM tb_employee WHERE id = ? and is_deleted=?`,
            [employee_id, 0]
        );

        if (existingEmployee.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Employee not found."
            });
        }

        // Delete the employee
        const [rows] = await db.execute(
            `Update tb_employee SET is_deleted=? WHERE id = ?`,
            [1, employee_id]
        );

        return res.status(200).send({
            success: true,
            message: "Employee Deleted Successfully",
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};


const EmployeeStatus = async (req, res) => {
    try {
        const { employee_id } = req.body;

        // Check if the employee exists
        const [existingEmployee] = await db.execute(
            `SELECT status FROM tb_employee WHERE id = ?`,
            [employee_id]
        );

        if (existingEmployee.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Employee not found."
            });
        }

        // Toggle the status
        const currentStatus = existingEmployee[0].status;
        const newStatus = currentStatus === 'on' ? 'off' : 'on';

        const [rows] = await db.execute(
            `UPDATE tb_employee SET status = ? WHERE id = ?`,
            [newStatus, employee_id]
        );

        return res.status(200).send({
            success: true,
            message: `Employee status changed to ${newStatus}`,
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

const GetContractByEmployeeId = async (req, res) => {
    try {
        const { employee_id } = req.body;
        if (!employee_id) {
            return res.status(400).send({
                success: false,
                message: "Provide employee id."
            });
        }
        const [existingEmployee] = await db.execute(
            `SELECT c.*, e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            w.worker_type as worker_type FROM tb_contract as c
            LEFT JOIN tb_employee as e ON e.id=c.employee_id
            LEFT JOIN tb_worker as w ON w.worker_id =c.worker_id
            WHERE c.employee_id = ?`,
            [employee_id]
        );
        return res.status(200).send({
            success: true,
            data: existingEmployee?.[0] || {}
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

const ActiveEmployee = async (req, res) => {
    try {
        const [employees] = await db.execute(
            `SELECT * FROM tb_employee WHERE status = 'on' and is_deleted='0'`
        );
        return res.status(200).send({
            success: true,
            data: employees
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

module.exports = { GetAllEmployee, CreateEmployee, UpdateEmployee, DeleteEmployee, EmployeeStatus, GetContractByEmployeeId, ActiveEmployee }
