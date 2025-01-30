const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');
const fs = require('fs');
const path = require('path');

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
            s.created_at as created_at,
            p.paydetails_type,
            c.WHT_rate as WHT_rate
            FROM tb_salary as s
            INNER JOIN  tb_paydetails as p on p.paydetails_id=s.paydetails_id
            INNER JOIN  tb_contract as c on c.employee_id=s.employee_id
            WHERE s.is_deleted='${0}'
            ORDER BY s.created_at DESC`,
        )
        const [existingWHT] = await db.execute(
            `SELECT * FROM tb_WHT_rate ORDER BY id DESC LIMIT 1`
        );

        rows.forEach((row) => {
            if (row.WHT_rate === 1) {
                row.WHT = (existingWHT[0].rate / 100) * row.basic_salary || 0; // Ensure basic_salary is handled safely
            } else {
                row.WHT = 0;
            }
        });

        return res.status(200).send({
            success: true,
            data: rows,
            existingWHT
        })
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}

const GetAllSalaryByMonth = async (req, res) => {
    try {
        const { month } = req.body; // Expecting 'month' in the format 'YYYY-MM'

        // Validate the month parameter if provided
        if (month && !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).send({
                success: false,
                message: "Invalid 'month' parameter. Please provide it in 'YYYY-MM' format."
            });
        }

        // Base SQL query for fetching individual salary data
        let sqlQuery = `
            SELECT 
                s.id as salary_id,
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
                s.created_at as created_at,
                p.paydetails_type,
                c.WHT_rate as WHT_rate,
                e.banknum,
                e.bankname as employee_bankname
            FROM tb_salary as s
            INNER JOIN tb_paydetails as p ON p.paydetails_id = s.paydetails_id
            INNER JOIN tb_contract as c ON c.employee_id = s.employee_id
            INNER JOIN tb_employee as e ON e.id = s.employee_id
            WHERE s.is_deleted = ?`;

        // Add a condition for the month if it's provided
        const queryParams = [0];
        if (month) {
            sqlQuery += ' AND s.month = ?';
            queryParams.push(month);
        }

        sqlQuery += ' ORDER BY s.created_at DESC';

        // Execute the query
        const [rows] = await db.execute(sqlQuery, queryParams);

        const [existingWHT] = await db.execute(
            `SELECT * FROM tb_WHT_rate ORDER BY id DESC LIMIT 1`
        );

        // Calculate WHT for each row and store it
        rows.forEach((row) => {
            if (row.WHT_rate === 1) {
                row.WHT = (existingWHT[0].rate / 100) * row.basic_salary || 0; // Calculate WHT if applicable
            } else {
                row.WHT = 0;
            }
        });

        // Calculate total WHT manually in JavaScript
        const totalWHT = rows.reduce((sum, row) => sum + (row.WHT || 0), 0);

        // SQL query to sum all relevant columns
        let sqlQuery1 = `
            SELECT 
                SUM(s.basic_salary) as total_basic_salary,
                SUM(s.overtime) as total_overtime,
                SUM(s.bonus) as total_bonus,
                SUM(s.total_earning) as Alltotal_earning,
                SUM(s.sso) as total_sso,
                SUM(s.deduction) as ALltotal_deduction,
                SUM(s.payback) as ALLtotal_payback,
                SUM(s.total_deduct) as Alltotal_deduct,
                SUM(s.net_income) as total_net_income
            FROM tb_salary as s
            WHERE s.is_deleted = ?`;

        // Add a condition for the month if it's provided
        const queryParams1 = [0];
        if (month) {
            sqlQuery1 += ' AND s.month = ?';
            queryParams1.push(month);
        }

        // Execute the query to get totals
        const [dataAll] = await db.execute(sqlQuery1, queryParams1);

        return res.status(200).send({
            success: true,
            data: rows,
            existingWHT,
            dataAll: dataAll[0],
            totalWHT  // Include the total WHT in the response
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};



const GetMultipleSalary = async (req, res) => {
    try {
        const { employee_ids, month } = req.body; // Expecting an array of employee IDs
        console.log("Request Body:", req.body);

        // Validate input
        if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Employee IDs must be provided as a non-empty array.",
            });
        }

        // Fetch WHT rate once
        const [existingWHT] = await db.execute(`SELECT * FROM tb_WHT_rate ORDER BY id DESC LIMIT 1`);
        const whtRate = existingWHT.length > 0 ? existingWHT[0].rate : 0;

        const ALLdata = [];

        for (const employee_id of employee_ids) {
            console.log("Fetching salary for employee_id:", employee_id);

            const query = `
                SELECT 
                    s.id AS salary_id,
                    s.month AS month,
                    s.employee_id AS employee_id,
                    s.employee_name AS employee_name,
                    s.paydetails_id AS paydetails_id,
                    s.bankname AS bankname,
                    s.basic_salary AS basic_salary,
                    s.overtime AS overtime,
                    s.total_ot AS total_ot,
                    s.ot_rate AS ot_rate,
                    s.housing AS housing,
                    s.bonus AS bonus,
                    s.total_earning AS total_earning,
                    s.sso AS sso,
                    s.days AS days,
                    s.days_thb AS days_thb,
                    s.deduction AS deduction,
                    s.payback AS payback,
                    s.total_deduct AS total_deduct,
                    s.net_income AS net_income,
                    s.sick AS sick,
                    s.sick_balance AS sick_balance,
                    s.sick_leave AS sick_leave,
                    s.annual AS annual,
                    s.annual_balance AS annual_balance,
                    s.personal_leave AS personal_leave,
                    s.borrow AS borrow,
                    s.advance_borrow AS advance_borrow,
                    s.reason AS reason,
                    s.sort AS sort,
                    s.is_deleted AS is_deleted,
                    s.created_at AS created_at,
                    p.paydetails_type,
                    c.WHT_rate AS WHT_rate
                FROM tb_salary AS s
                LEFT JOIN tb_paydetails AS p ON p.paydetails_id = s.paydetails_id
                LEFT JOIN tb_contract AS c ON c.employee_id = s.employee_id
                WHERE s.is_deleted = 0 AND s.employee_id = ? AND month = ?
                ORDER BY s.created_at DESC
            `;

            // Execute query for the current employee_id
            const [rows] = await db.execute(query, [employee_id, month]);

            // Calculate WHT for each row
            rows.forEach((row) => {
                if (row.WHT_rate === 1) {
                    row.WHT = (whtRate / 100) * row.basic_salary || 0; // Calculate WHT if WHT_rate is 1
                } else {
                    row.WHT = 0; // Set WHT to 0 otherwise
                }
            });

            // Add rows to the final result
            ALLdata.push(...rows);
        }

        // Log fetched data for debugging
        console.log("Fetched Data:", ALLdata);

        // Send response
        return res.status(200).send({
            success: true,
            data: ALLdata,
        });
    } catch (err) {
        console.error("Error:", err.message);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};


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


const AddAllEmployeeSalary = async (req, res) => {
    try {
        const { salaries } = req.body; // Array of salary records
        console.log(req.body);

        if (!salaries || !Array.isArray(salaries)) {
            return res.status(400).send({
                success: false,
                message: "Invalid input. 'salaries' should be an array of salary records.",
            });
        }

        const successfulSalaries = [];
        const failedSalaries = [];

        for (const salary of salaries) {
            const {
                month, employee_id, employee_name, bankname, basic_salary, overtime, ot_rate, total_ot,
                housing, bonus, sso, deduction, payback,
                reason, sick, sick_balance, annual, annual_balance, borrow, advance_borrow,
            } = salary;

            try {
                // Check if the salary record already exists
                const [existingRecord] = await db.execute(
                    `SELECT id FROM tb_salary WHERE employee_id = ? AND month = ? AND is_deleted=?`,
                    [employee_id, month, 0]
                );

                if (existingRecord.length > 0) {
                    failedSalaries.push({
                        employee_id,
                        message: "Salary record already exists for the given employee and month.",
                    });
                    continue; // Skip this record
                }
                let total_deduct = parseFloat(sso) + parseFloat(payback) + parseFloat(deduction);
                total_deduct = total_deduct.toFixed(2);

                let total_earning = parseFloat(basic_salary) + parseFloat(total_ot) + parseFloat(housing) + parseFloat(bonus);
                total_earning = total_earning.toFixed(2);

                let net_income = total_earning - total_deduct;
                net_income = net_income.toFixed(2);

                let advanceBorrow;
                if (payback && advance_borrow) {
                    advanceBorrow = advance_borrow - payback; // Update the outer variable
                }

                // Insert the new salary record
                const [result] = await db.execute(
                    `INSERT INTO tb_salary 
                        (month, employee_id, employee_name, paydetails_id, bankname, basic_salary, overtime, ot_rate, total_ot, housing, bonus, 
                        total_earning, sso, deduction, payback, total_deduct, net_income, reason, sick, sick_balance, annual, annual_balance, borrow, advance_borrow)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        month, employee_id, employee_name, 1, bankname, basic_salary, overtime, ot_rate, total_ot, housing, bonus,
                        total_earning, sso, deduction, payback, total_deduct, net_income, reason, sick, sick_balance, annual, annual_balance,
                        borrow, advanceBorrow || null,
                    ]
                );

                // Add to successful salaries
                successfulSalaries.push({
                    employee_id,
                    message: "Salary added successfully.",
                    id: result.insertId,
                });
            } catch (error) {
                // Handle errors for this salary record
                success: false,
                    failedSalaries.push({
                        employee_id,
                        message: error.message,
                    });
            }
        }

        return res.status(200).send({
            success: true,
            message: "Salary processing completed.",
            successfulSalaries,
            failedSalaries,
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};

/* const GetSalariesForMultipleEmployees = async (req, res) => {
    try {
        const { month, employee_ids } = req.body;

        if (!month || !Array.isArray(employee_ids) || employee_ids.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Month and Employee IDs are required",
            });
        }

        const [year, selectedMonth] = month.split('-');
        const monthPattern = `${year}-${selectedMonth}%`;

        let allEmployeeData = [];

        // Loop through each employee ID to fetch the salary details
        for (const employee_id of employee_ids) {
            let data = {};

            // Fetch overtime
            const [overtime] = await db.execute(
                `SELECT SUM(overtime) AS total FROM tb_attendance WHERE employee_id = ? AND is_deleted = 0 AND workday LIKE ?`,
                [employee_id, monthPattern]
            );
            data.overtime = overtime[0]?.total || 0;

            // Fetch hours worked
            const [hoursWorked] = await db.execute(
                `SELECT SUM(hours_worked) AS total FROM tb_attendance WHERE employee_id = ? AND is_deleted = 0 AND workday LIKE ?`,
                [employee_id, monthPattern]
            );
            data.hours_worked = hoursWorked[0]?.total || 0;

            // Fetch days worked
            const [daysWorked] = await db.execute(
                `SELECT SUM(day_worked) AS total FROM tb_attendance WHERE employee_id = ? AND is_deleted = 0 AND workday LIKE ?`,
                [employee_id, monthPattern]
            );
            data.day_worked = daysWorked[0]?.total || 0;

            // Fetch employee details
            const [employeeDetails] = await db.execute(
                `SELECT * FROM tb_employee WHERE id = ? AND is_deleted = 0`,
                [employee_id]
            );

            if (employeeDetails.length === 0) {
                return res.status(404).send({
                    success: false,
                    message: `Employee with ID ${employee_id} not found.`,
                });
            }

            const emp = employeeDetails[0];
            data.employee_name = `${emp.f_name} ${emp.l_name}`;
            data.worker_id = emp.worker_id;
            data.bankname = emp.bankname;

            // Fetch vacation details
            const [annual] = await db.execute(
                `SELECT SUM(days) AS total FROM tb_vacation WHERE employee_id = ? AND is_deleted = 0 AND start_date LIKE ? AND leaves_id = ?`,
                [employee_id, `${year}%`, 1]
            );
            data.annual = annual[0]?.total || 0;

            const [sick] = await db.execute(
                `SELECT SUM(days) AS total FROM tb_vacation WHERE employee_id = ? AND is_deleted = 0 AND start_date LIKE ? AND leaves_id = ?`,
                [employee_id, `${year}%`, 2]
            );
            data.sick = sick[0]?.total || 0;

            // Fetch contract details (basic salary, overtime rate, SSO, etc.)
            const [salary] = await db.execute(
                `SELECT * FROM tb_contract WHERE employee_id = ? AND is_deleted = 0 ORDER BY id DESC LIMIT 1`,
                [employee_id]
            );

            if (salary.length > 0) {
                const sal = salary[0];
                if (sal.worker_id == '1') {
                    const [countDayWork] = await db.execute(
                        `SELECT COUNT(id) AS total FROM tb_attendance WHERE employee_id = ? AND is_deleted=0 AND workday LIKE ?`,
                        [employee_id, monthPattern]
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

            const [otRate] = await db.execute(
                `SELECT SUM(ot_rate) AS total FROM tb_contract WHERE employee_id = ? AND is_deleted=0`,
                [employee_id]
            );
            data.ot_rate = otRate[0]?.total || 0;

            const [sickLeave] = await db.execute(
                `SELECT SUM(sick_leave) AS total FROM tb_contract WHERE employee_id = ? AND is_deleted=0`,
                [employee_id]
            );
            data.sick_leave = sickLeave[0]?.total || 0;

            const [housing] = await db.execute(
                `SELECT SUM(housing) AS total FROM tb_contract WHERE employee_id = ? AND is_deleted=0`,
                [employee_id]
            );
            data.housing = housing[0]?.total || 0;

            const [personalLeave] = await db.execute(
                `SELECT SUM(personal_leave) AS total FROM tb_contract WHERE employee_id = ? AND is_deleted=0`,
                [employee_id]
            );
            data.personal_leave = personalLeave[0]?.total || 0;

            const [bonus] = await db.execute(
                `SELECT SUM(amount) AS total FROM tb_bonusanddeduction WHERE employee_id = ? AND transactions_id = 1 AND is_deleted=0`,
                [employee_id]
            );
            data.bonus = bonus[0]?.total || 0;

            const [deduction] = await db.execute(
                `SELECT SUM(amount) AS total FROM tb_bonusanddeduction WHERE employee_id = ? AND transactions_id = 2 AND is_deleted=0`,
                [employee_id]
            );
            data.deduction = deduction[0]?.total || 0;

            const [bonusDeduction] = await db.execute(
                `SELECT reason FROM tb_bonusanddeduction WHERE employee_id = ? AND is_deleted=0 LIMIT 1`,
                [employee_id]
            );
            data.reason = bonusDeduction.length > 0 ? bonusDeduction[0].reason : '';

            const [borrow] = await db.execute(
                `SELECT SUM(amount) AS total FROM tb_advancepayments WHERE employee_id = ? AND transaction_id = 1 AND is_deleted=0`,
                [employee_id]
            );

            const paybackquery = `
            SELECT SUM(amount) AS total 
            FROM tb_advancepayments 
            WHERE employee_id = ? 
            AND transaction_id = 2 
            AND is_deleted = 0 
            AND DATE_FORMAT(transaction_date, "%Y-%m") = ?
        `;

            const [payback] = await db.execute(paybackquery, [employee_id, `${year}-${selectedMonth}`]);

            const [paybackMonth] = await db.execute(
                `SELECT SUM(amount) AS total FROM tb_advancepayments WHERE employee_id = ? AND transaction_date LIKE ? AND transaction_id = 2 AND is_deleted=0`,
                [employee_id, monthPattern]
            );

            data.advance_borrow = (borrow[0]?.total || 0) - (payback[0]?.total || 0);
            data.balance_borrow = borrow[0]?.total - data.advance_borrow;
            data.borrow = data.balance_borrow || 0;
            data.payback_month = paybackMonth[0]?.total || 0;
            data.payback = payback[0]?.total || 0;
            data.total_ot = data.ot_rate * data.overtime || 0;
            data.sick_balance = parseInt(data.sick_leave || 0) - parseInt(data.sick || 0);
            data.annual_balance = parseInt(data.personal_leave || 0) - parseInt(data.annual || 0);

            // Calculate total deductions and net income
            const total_deduct = parseFloat(data.sso) + parseFloat(data.payback) + parseFloat(data.deduction);
            data.total_deduct = total_deduct.toFixed(2);

            const total_earning = parseFloat(data.basic_salary) + parseFloat(data.total_ot) + parseFloat(data.housing) + parseFloat(data.bonus);
            data.total_earning = total_earning.toFixed(2);

            const net_income = total_earning - total_deduct;
            data.net_income = net_income.toFixed(2);

            // Insert salary record for the employee
            const [existingSalary] = await db.execute(
                `SELECT id FROM tb_salary WHERE employee_id = ? AND month = ?`,
                [employee_id, month]
            );

            if (existingSalary.length > 0) {
                return res.status(400).send({
                    success: false,
                    message: `Salary record already exists for employee ${employee_id} in the given month.`,
                });
            }

            // Insert salary record for the employee
            await db.execute(
                `INSERT INTO tb_salary 
                (month, employee_id, employee_name, paydetails_id, bankname, basic_salary, overtime, ot_rate, total_ot, housing, bonus,
                total_earning, sso, deduction, payback, total_deduct, net_income, reason, sick, sick_balance, annual, annual_balance, borrow, advance_borrow)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    month, employee_id, data.employee_name, null, data.bankname, data.basic_salary, data.overtime, data.ot_rate, data.total_ot,
                    data.housing, data.bonus, data.total_earning, data.sso, data.deduction, data.payback, data.total_deduct, data.net_income,
                    data.reason, data.sick, data.sick_balance, data.annual, data.annual_balance, data.borrow, data.advance_borrow
                ]
            );

            allEmployeeData.push(data);
        }

        return res.status(200).send({
            success: true,
            message: "Salary processing completed for all employees.",
            data: allEmployeeData,
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "An error occurred while processing salaries: " + error.message,
        });
    }
};
 */

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
                    bankname || null,
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
        console.log(req.body);

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
            `SELECT SUM(overtime) AS total FROM tb_attendance WHERE employee_id = ? AND is_deleted=0 AND workday LIKE ?`,
            [employee, monthPattern]
        );
        data.overtime = overtime[0]?.total || 0;

        // Fetch hours worked
        const [hoursWorked] = await db.execute(
            `SELECT SUM(hours_worked) AS total FROM tb_attendance WHERE employee_id = ? AND is_deleted=0 AND workday LIKE ?`,
            [employee, monthPattern]
        );
        data.hours_worked = hoursWorked[0]?.total || 0;

        // Fetch days worked
        const [daysWorked] = await db.execute(
            `SELECT SUM(day_worked) AS total FROM tb_attendance WHERE employee_id = ? AND is_deleted=0 AND workday LIKE ?`,
            [employee, monthPattern]
        );
        data.day_worked = daysWorked[0]?.total || 0;

        // Fetch employee details
        const [employeeDetails] = await db.execute(
            `SELECT * FROM tb_employee WHERE id = ? AND is_deleted=0`,
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
            `SELECT SUM(days) AS total FROM tb_vacation WHERE employee_id = ? AND is_deleted=0 AND  start_date LIKE ? AND leaves_id = ?`,
            [employee, `${year}%`, 1]
        );
        console.log(annual);

        data.annual = annual[0]?.total || 0;

        const [sick] = await db.execute(
            `SELECT SUM(days) AS total FROM tb_vacation WHERE employee_id = ? AND is_deleted=0 AND start_date LIKE ? AND leaves_id = ?`,
            [employee, `${year}%`, 2]
        );
        data.sick = sick[0]?.total || 0;

        // Fetch contract details
        const [salary] = await db.execute(
            `SELECT * FROM tb_contract WHERE employee_id = ? AND is_deleted=0 ORDER BY id DESC LIMIT 1`,
            [employee]
        );

        if (salary.length > 0) {
            const sal = salary[0];

            if (sal.worker_id == '1') {
                const [countDayWork] = await db.execute(
                    `SELECT COUNT(id) AS total FROM tb_attendance WHERE employee_id = ? AND is_deleted=0 AND workday LIKE ?`,
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
            `SELECT SUM(ot_rate) AS total FROM tb_contract WHERE employee_id = ? AND is_deleted=0`,
            [employee]
        );
        data.ot_rate = otRate[0]?.total || 0;

        const [sickLeave] = await db.execute(
            `SELECT SUM(sick_leave) AS total FROM tb_contract WHERE employee_id = ? AND is_deleted=0`,
            [employee]
        );
        data.sick_leave = sickLeave[0]?.total || 0;

        const [housing] = await db.execute(
            `SELECT SUM(housing) AS total FROM tb_contract WHERE employee_id = ? AND is_deleted=0`,
            [employee]
        );
        data.housing = housing[0]?.total || 0;

        const [personalLeave] = await db.execute(
            `SELECT SUM(personal_leave) AS total FROM tb_contract WHERE employee_id = ? AND is_deleted=0`,
            [employee]
        );
        data.personal_leave = personalLeave[0]?.total || 0;

        const [bonus] = await db.execute(
            `SELECT SUM(amount) AS total FROM tb_bonusanddeduction WHERE employee_id = ? AND transactions_id = 1 AND is_deleted=0`,
            [employee]
        );


        data.bonus = bonus[0]?.total || 0;

        const [deduction] = await db.execute(
            `SELECT SUM(amount) AS total FROM tb_bonusanddeduction WHERE employee_id = ? AND transactions_id = 2 AND is_deleted=0`,
            [employee]
        );
        data.deduction = deduction[0]?.total || 0;

        const [bonusDeduction] = await db.execute(
            `SELECT reason FROM tb_bonusanddeduction WHERE employee_id = ? AND is_deleted=0 LIMIT 1`,
            [employee]
        );
        data.reason = bonusDeduction.length > 0 ? bonusDeduction[0].reason : '';

        const [borrow] = await db.execute(
            `SELECT SUM(amount) AS total FROM tb_advancepayments WHERE employee_id = ? AND transaction_id = 1 AND is_deleted=0`,
            [employee]
        );

        const paybackquery = `
        SELECT SUM(amount) AS total 
        FROM tb_advancepayments 
        WHERE employee_id = ? 
        AND transaction_id = 2 
        AND is_deleted = 0 
        AND DATE_FORMAT(transaction_date, "%Y-%m") = ?
    `;

        const [payback] = await db.execute(paybackquery, [employee, `${year}-${selectedMonth}`]);

        const [paybackMonth] = await db.execute(
            `SELECT SUM(amount) AS total FROM tb_advancepayments WHERE employee_id = ? AND transaction_date LIKE ? AND transaction_id = 2 AND is_deleted=0`,
            [employee, monthPattern]
        );
        console.log(data.sick_leave);
        console.log(data.sick);


        data.advance_borrow = (borrow[0]?.total || 0) - (payback[0]?.total || 0);
        data.balance_borrow = borrow[0]?.total - data.advance_borrow;
        data.borrow = data.balance_borrow || 0;
        data.payback_month = paybackMonth[0]?.total || 0;
        data.payback = payback[0]?.total || 0;
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

const UploadPdf = async (req, res) => {
    try {
        if (!req.file) {
            // Handle case where file is not present in the request
            console.error('No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const document = req.file.filename;
        const uploadFolderPath = path.join(__dirname, '../public/image');  // Adjust to your folder path

        // Extract the base name from the uploaded file (e.g., 'INV-202412040' part)
        const baseName = document.split('_')[0]; // Assuming filename format like 'INV-202412040_Invoice_30-12-2024'

        // Read all files in the upload folder
        const files = fs.readdirSync(uploadFolderPath);

        // Iterate through the files and delete those that start with the same base name, except the current one
        files.forEach((file) => {
            if (file.startsWith(baseName) && file !== document) {  // Skip the current file
                const filePath = path.join(uploadFolderPath, file);
                fs.unlinkSync(filePath);  // Delete the file
                console.log(`Deleted existing file: ${file}`);
            }
        });

        // Now the file has been deleted, proceed with uploading the new file
        res.status(200).json({
            success: true,
            message: 'Uploaded and old files deleted successfully (excluding the current one)'
        });
    } catch (error) {
        console.error('Error in file upload:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = { GetAllSalary, GetAllSalaryByMonth, AddSalary, GetMultipleSalary, UpdateSalary, EmpAttendanceByMonth, GetSalaryById, DeleteSalary, GetEmployeeWorking, UploadPdf, AddAllEmployeeSalary }
