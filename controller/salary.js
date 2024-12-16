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
        const { month, employee_id, employee_name, paydetails_id, bankname, basic_salary, overtime, ot_rate, total_ot,
            housing, bonus, total_earning, sso, deduction, payback,
            total_deduct, net_income, reason, sick, sick_balance, annual, annual_balance, borrow, advance_borrow } = req.body;
        console.log(req.body);

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
                `INSERT into tb_salary (month, employee_id, employee_name, paydetails_id, bankname, basic_salary, overtime, ot_rate, total_ot, housing, bonus,
                total_earning, sso, deduction, payback, total_deduct, net_income, reason, sick, sick_balance, annual, annual_balance, borrow, advance_borrow ) values (?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [month, employee_id, employee_name, paydetails_id, bankname, basic_salary, overtime, ot_rate, total_ot, housing, bonus,
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
            message: error.message,
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
console.log(req.body);

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


const GetEmployeeWorking = async (req, res) => {
    try {
        const { month, employee } = req.body;

        if (!month || !employee) {
            return res.status(400).send({
                success: false,
                message: "Month and Employee ID are required",
            });
        }

        const [year, selectedMonth] = month.split('-');
        const monthPattern = `${year}-${selectedMonth}%`;

        let data = {};

        // Fetch overtime
        const [overtime] = await db.execute(
            `SELECT SUM(overtime) AS total FROM tb_attendance WHERE employee_id = ? AND workday LIKE ?`,
            [employee, monthPattern]
        );
        data.overtime = overtime[0]?.total || 0;

        // Fetch hours worked
        const [hoursWorked] = await db.execute(
            `SELECT SUM(hours_worked) AS total FROM tb_attendance WHERE employee_id = ? AND workday LIKE ?`,
            [employee, monthPattern]
        );
        data.hours_worked = hoursWorked[0]?.total || 0;

        // Fetch days worked
        const [daysWorked] = await db.execute(
            `SELECT SUM(day_worked) AS total FROM tb_attendance WHERE employee_id = ? AND workday LIKE ?`,
            [employee, monthPattern]
        );
        data.day_worked = daysWorked[0]?.total || 0;

        // Fetch employee details
        const [employeeDetails] = await db.execute(
            `SELECT * FROM tb_employee WHERE id = ?`,
            [employee]
        );

        if (employeeDetails.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Employee not found",
            });
        }

        const emp = employeeDetails[0];
        data.employee_start_date = new Date(emp.employee_startdate).toLocaleDateString();
        data.employee_name = `${emp.f_name} ${emp.l_name}`;
        data.worker_id = emp.worker_id;
        data.bankname = emp.bankname;

        // Fetch vacation details
        const [annual] = await db.execute(
            `SELECT SUM(days) AS total FROM tb_vacation WHERE employee_id = ? AND start_date LIKE ? AND leaves_id = ?`,
            [employee, `${year}%`, 1]
        );
        data.annual = annual[0]?.total || 0;

        const [sick] = await db.execute(
            `SELECT SUM(days) AS total FROM tb_vacation WHERE employee_id = ? AND start_date LIKE ? AND leaves_id = ?`,
            [employee, `${year}%`, 2]
        );
        data.sick = sick[0]?.total || 0;

        // Fetch contract details
        const [salary] = await db.execute(
            `SELECT * FROM tb_contract WHERE employee_id = ? ORDER BY id DESC LIMIT 1`,
            [employee]
        );

        if (salary.length > 0) {
            const sal = salary[0];
            if (sal.worker_id === '1') {
                const [countDayWork] = await db.execute(
                    `SELECT COUNT(id) AS total FROM tb_attendance WHERE employee_id = ? AND workday LIKE ?`,
                    [employee, monthPattern]
                );

                data.sso = parseFloat(sal.sso * countDayWork[0]?.total).toFixed(2);
                data.basic_salary = parseFloat(sal.basic_salary * countDayWork[0]?.total).toFixed(2);
            } else {
                data.sso = sal.sso;
                data.basic_salary = sal.basic_salary;
            }
        } else {
            data.sso = 0;
            data.basic_salary = 0;
        }

        // Fetch additional details
        const [otRate] = await db.execute(
            `SELECT SUM(ot_rate) AS total FROM tb_contract WHERE employee_id = ?`,
            [employee]
        );
        data.ot_rate = otRate[0]?.total || 0;

        const [sickLeave] = await db.execute(
            `SELECT SUM(sick_leave) AS total FROM tb_contract WHERE employee_id = ?`,
            [employee]
        );
        data.sick_leave = sickLeave[0]?.total || 0;

        const [housing] = await db.execute(
            `SELECT SUM(housing) AS total FROM tb_contract WHERE employee_id = ?`,
            [employee]
        );
        data.housing = housing[0]?.total || 0;

        const [personalLeave] = await db.execute(
            `SELECT SUM(personal_leave) AS total FROM tb_contract WHERE employee_id = ?`,
            [employee]
        );
        data.personal_leave = personalLeave[0]?.total || 0;

        const [bonus] = await db.execute(
            `SELECT SUM(amount) AS total FROM tb_bonusanddeduction WHERE employee_id = ? AND transactions_id = 1`,
            [employee]
        );
        data.bonus = bonus[0]?.total || 0;

        const [deduction] = await db.execute(
            `SELECT SUM(amount) AS total FROM tb_bonusanddeduction WHERE employee_id = ? AND transactions_id = 2`,
            [employee]
        );
        data.deduction = deduction[0]?.total || 0;

        const [bonusDeduction] = await db.execute(
            `SELECT reason FROM tb_bonusanddeduction WHERE employee_id = ? LIMIT 1`,
            [employee]
        );
        data.reason = bonusDeduction.length > 0 ? bonusDeduction[0].reason : '';

        const [borrow] = await db.execute(
            `SELECT SUM(amount) AS total FROM tb_advancepayments WHERE employee_id = ? AND transaction_id = 1`,
            [employee]
        );

        const [payback] = await db.execute(
            `SELECT SUM(amount) AS total FROM tb_advancepayments WHERE employee_id = ? AND transaction_id = 2`,
            [employee]
        );

        const [paybackMonth] = await db.execute(
            `SELECT SUM(amount) AS total FROM tb_advancepayments WHERE employee_id = ? AND transaction_date LIKE ? AND transaction_id = 2`,
            [employee, monthPattern]
        );

        data.advance_borrow = (borrow[0]?.total || 0) - (payback[0]?.total || 0);
        data.balance_borrow = borrow[0]?.total - data.advance_borrow;
        data.borrow = borrow[0]?.total || 0;
        data.payback_month = paybackMonth[0]?.total || 0;
        data.total_ot = data.ot_rate * data.overtime || 0;
        data.sick_balance = parseInt(data.sick_leave || 0) - parseInt(data.sick || 0);
        data.annual_balance = parseInt(data.personal_leave || 0) - parseInt(data.annual || 0);

        res.status(200).send({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { GetAllSalary, AddSalary, UpdateSalary, EmpAttendanceByMonth, GetSalaryById, DeleteSalary, GetEmployeeWorking }
