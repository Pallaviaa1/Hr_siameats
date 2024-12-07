const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

const GetAllSalary = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT s.id as salary_id,
            s.month as month,
            s.employee_id as employee_id,
            s.employee_name as employee_name,
            s.paydetails_id as paydetails_id,
            s.bankname as bankname,
            s.basic_salary as basic_salary,
            s.overtime as overtime,
            s.total_ot as total_ot,
            s.ot_rate as ot_rate,
            s.housing as housing,
            s.bonus as bonus,
            s.total_earning as total_earning,
            s.sso as sso,
            s.days as days,
            s.days_thb as days_thb,
            s.deduction as deduction,
            s.payback as payback,
            s.total_deduct as total_deduct,
            s.net_income as net_income,
            s.sick as sick,
            s.sick_balance as sick_balance,
            s.sick_leave as sick_leave,
            s.annual as annual,
            s.annual_balance as annual_balance,
            s.personal_leave as personal_leave,
            s.borrow as borrow,
            s.advance_borrow as advance_borrow,
            s.reason as reason,
            s.sort as sort,
            s.is_deleted as is_deleted,
            s.created_at as created_at
            FROM tb_salary as s
            WHERE s.is_deleted='${0}'
            ORDER BY s.created_at DESC`,
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

const AddSalary = async (req, res) => {
    try {
        const { month, employee_id, employee_name, paydetails_id, basic_salary, overtime, ot_rate, total_ot, housing, bonus,
            total_earning, sso, deduction, payback, total_deduct, net_income, reason, sick, sick_balance, annual, annual_balance, borrow, advance_borrow } = req.body;
        const [existingRecord] = await db.execute(
            `SELECT id FROM tb_salary WHERE employee_id = ? AND month = ?`,
            [employee_id, month]
        );

        if (existingRecord.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Salary record already exists for the given employee and month."
            });
        }
        else {
            const [rows, fields] = await db.execute(
                `INSERT into tb_salary (month, employee_id, employee_name, paydetails_id, basic_salary, overtime, ot_rate, total_ot, housing, bonus,
                total_earning, sso, deduction, payback, total_deduct, net_income, reason, sick, sick_balance, annual, annual_balance, borrow, advance_borrow ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [month, employee_id, employee_name, paydetails_id, basic_salary, overtime, ot_rate, total_ot, housing, bonus,
                    total_earning, sso, deduction, payback, total_deduct, net_income, reason, sick, sick_balance, annual, annual_balance, borrow, advance_borrow])

            return res.status(200).send({
                success: true,
                message: "Salary Added Successfully",
                data: rows
            })
        }

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}


const UpdateSalary = async (req, res) => {
    try {
        const {
            salary_id,
            month,
            employee_id,
            bankname,
            paydetails_id,
            basic_salary,
            overtime,
            ot_rate,
            total_ot,
            housing,
            bonus,
            total_earning,
            sso,
            deduction,
            payback,
            total_deduct,
            net_income,
            reason,
            sick,
            sick_balance,
            annual,
            annual_balance,
            borrow,
            advance_borrow
        } = req.body;

        // Check if the record exists
        const [existingRecord] = await db.execute(
            `SELECT id FROM tb_salary WHERE id =?`,
            [salary_id]
        );

        if (existingRecord.length > 0) {
            // Update the existing record
            await db.execute(
                `UPDATE tb_salary SET 
                    month=?,
                    employee_id=?,
                    bankname = ?, 
                    paydetails_id = ?, 
                    basic_salary = ?, 
                    overtime = ?, 
                    ot_rate = ?, 
                    total_ot = ?, 
                    housing = ?, 
                    bonus = ?, 
                    total_earning = ?, 
                    sso = ?, 
                    deduction = ?, 
                    payback = ?, 
                    total_deduct = ?, 
                    net_income = ?, 
                    reason = ?, 
                    sick = ?, 
                    sick_balance = ?, 
                    annual = ?, 
                    annual_balance = ?, 
                    borrow = ?, 
                    advance_borrow = ?
                WHERE id = ?`,
                [
                    month,
                    employee_id,
                    bankname,
                    paydetails_id,
                    basic_salary,
                    overtime,
                    ot_rate,
                    total_ot,
                    housing,
                    bonus,
                    total_earning,
                    sso,
                    deduction,
                    payback,
                    total_deduct,
                    net_income,
                    reason,
                    sick,
                    sick_balance,
                    annual,
                    annual_balance,
                    borrow,
                    advance_borrow,
                    salary_id
                ]
            );

            return res.status(200).send({
                success: true,
                message: "Salary updated successfully for the employee."
            });
        } else {
            // Record not found
            return res.status(400).send({
                success: false,
                message: "Salary record not found."
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};

const EmpAttendanceByMonth = async (req, res) => {
    try {
        const { month, employee_id } = req.body;

        const [rows, fields] = await db.execute(
            `SELECT 
               DATE_FORMAT(a.workday, '%Y-%m-%d') AS Date_of_employment,
                a.morning_in as Working_hours,
                a.afternoon_out as Time_off_work,
                a.overtime as OT
            FROM tb_attendance as a
            WHERE 
                DATE_FORMAT(a.workday, '%Y-%m') = ? 
                AND a.employee_id = ?
            ORDER BY a.workday ASC`,
            [month, employee_id]
        );

        return res.status(200).send({
            success: true,
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};


const GetSalaryById = async (req, res) => {
    try {
        const { salary_id } = req.body
        const [rows, fields] = await db.execute(
            `SELECT s.id as salary_id,
            s.month as month,
            s.employee_id as employee_id,
            s.employee_name as employee_name,
            s.paydetails_id as paydetails_id,
            s.bankname as bankname,
            s.basic_salary as basic_salary,
            s.overtime as overtime,
            s.total_ot as total_ot,
            s.ot_rate as ot_rate,
            s.housing as housing,
            s.bonus as bonus,
            s.total_earning as total_earning,
            s.sso as sso,
            s.days as days,
            s.days_thb as days_thb,
            s.deduction as deduction,
            s.payback as payback,
            s.total_deduct as total_deduct,
            s.net_income as net_income,
            s.sick as sick,
            s.sick_balance as sick_balance,
            s.sick_leave as sick_leave,
            s.annual as annual,
            s.annual_balance as annual_balance,
            s.personal_leave as personal_leave,
            s.borrow as borrow,
            s.advance_borrow as advance_borrow,
            s.reason as reason,
            s.sort as sort
            FROM tb_salary as s
            WHERE s.is_deleted='${0}' and id='${salary_id}'`,
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

const DeleteSalary = async (req, res) => {
    try {
        const { salary_id } = req.body;

        // Check if the employee exists
        const [existingEmployee] = await db.execute(
            `SELECT * FROM tb_salary WHERE id = ? and is_deleted=?`,
            [salary_id, 0]
        );

        if (existingEmployee.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Salary not found."
            });
        }

        // Delete the employee
        const [rows] = await db.execute(
            `Update tb_salary SET is_deleted=? WHERE id = ?`,
            [1, salary_id]
        );

        return res.status(200).send({
            success: true,
            message: "Salary Deleted Successfully",
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};


module.exports = { GetAllSalary, AddSalary, UpdateSalary, EmpAttendanceByMonth, GetSalaryById, DeleteSalary }
