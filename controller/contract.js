const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

const GetAllcontract = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT c.id as contract_id,
            c.employee_id as employee_id,
            c.contract_date as contract_date,
            c.basic_salary as basic_salary,
            c.ot_rate as ot_rate,
            c.sso as sso,
            c.sso_rate as ssoRate,
            c.WHT_rate as WHTRate,
            c.sick_leave as sick_leave,
            c.personal_leave as personal_leave,
            c.housing as housing,
            c.worker_id as worker_id,
            c.created_at as created_at,
            c.is_deleted as is_deleted,
            e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            w.worker_type as worker_type
            FROM tb_contract as c
            LEFT JOIN tb_employee as e ON e.id=c.employee_id
            LEFT JOIN tb_worker as w ON w.worker_id =c.worker_id
            WHERE c.is_deleted='${0}'
            ORDER BY c.created_at DESC`,
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

/* const Addcontract = async (req, res) => {
    try {
        const { employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, housing, sick_leave, personal_leave } = req.body;

        const [rows, fields] = await db.execute(
            `INSERT into tb_contract (employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, housing, sick_leave, personal_leave ) values (?,?,?,?,?,?,?,?,?)`,
            [employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, housing, sick_leave, personal_leave])

        return res.status(200).send({
            success: true,
            message: "contract Added Successfully",
            data: rows
        })

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
} */

const Addcontract = async (req, res) => {
    try {
        const { employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, ssoRate, WHTRate, housing, sick_leave, personal_leave } = req.body;

        const [rows, fields] = await db.execute(
            `INSERT into tb_contract (employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, sso_rate, WHT_rate, housing, sick_leave, personal_leave ) values (?,?,?,?,?,?,?,?,?,?,?)`,
            [employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, ssoRate, WHTRate, housing, sick_leave, personal_leave])

        return res.status(200).send({
            success: true,
            message: "contract Added Successfully",
            data: rows
        })

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}

/* const Updatecontract = async (req, res) => {
    try {
        const {
            contract_id, employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, housing, sick_leave, personal_leave
        } = req.body;

        // Check if the record exists
        const [existingRecord] = await db.execute(
            `SELECT id FROM tb_contract WHERE id =?`,
            [contract_id]
        );

        if (existingRecord.length > 0) {
            // Update the existing record
            await db.execute(
                `UPDATE tb_contract SET 
                   employee_id=?, worker_id=?, contract_date=?, basic_salary=?, ot_rate=?, sso=?, housing=?, sick_leave=?, personal_leave=?
                WHERE id = ?`,
                [
                    employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, housing, sick_leave, personal_leave, contract_id
                ]
            );

            return res.status(200).send({
                success: true,
                message: "contract updated successfully."
            });
        } else {
            // Record not found
            return res.status(400).send({
                success: false,
                message: "contract record not found."
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
}; */

const Updatecontract = async (req, res) => {
    try {
        const {
            contract_id, employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, ssoRate, WHTRate, housing, sick_leave, personal_leave
        } = req.body;

        // Check if the record exists
        const [existingRecord] = await db.execute(
            `SELECT id FROM tb_contract WHERE id =?`,
            [contract_id]
        );

        if (existingRecord.length > 0) {
            // Update the existing record
            await db.execute(
                `UPDATE tb_contract SET 
                   employee_id=?, worker_id=?, contract_date=?, basic_salary=?, ot_rate=?, sso=?, sso_rate=?, WHT_rate=?, housing=?, sick_leave=?, personal_leave=?
                WHERE id = ?`,
                [
                    employee_id, worker_id, contract_date, basic_salary, ot_rate, sso, ssoRate, WHTRate, housing, sick_leave, personal_leave, contract_id
                ]
            );

            return res.status(200).send({
                success: true,
                message: "contract updated successfully."
            });
        } else {
            // Record not found
            return res.status(400).send({
                success: false,
                message: "contract record not found."
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};

const GetcontractById = async (req, res) => {
    try {
        const { contract_id } = req.body
        const [rows, fields] = await db.execute(
            `SELECT c.id as contract_id,
            c.employee_id as employee_id,
            c.contract_date as contract_date,
            c.basic_salary as basic_salary,
            c.ot_rate as ot_rate,
            c.sso as sso,
            c.sick_leave as sick_leave,
            c.personal_leave as personal_leave,
            c.housing as housing,
            c.worker_id as worker_id,
            c.created_at as created_at,
            c.is_deleted as is_deleted,
            e.f_name as f_name,
            e.l_name as l_name,
            e.n_name as n_name,
            w.worker_type as worker_type
            FROM tb_contract as c
            LEFT JOIN tb_employee as e ON e.id=c.employee_id
            LEFT JOIN tb_worker as w ON w.worker_id =c.worker_id
            WHERE c.is_deleted='${0}' and c.id='${contract_id}'`,
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
                message: "contract record not found."
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
}

const Deletecontract = async (req, res) => {
    try {
        const { contract_id } = req.body;

        // Check if the employee exists
        const [existingEmployee] = await db.execute(
            `SELECT * FROM tb_contract WHERE id = ? and is_deleted=?`,
            [contract_id, 0]
        );

        if (existingEmployee.length === 0) {
            return res.status(400).send({
                success: false,
                message: "contract not found."
            });
        }

        // Delete the employee
        const [rows] = await db.execute(
            `Update tb_contract SET is_deleted=? WHERE id = ?`,
            [1, contract_id]
        );

        return res.status(200).send({
            success: true,
            message: "contract Deleted Successfully",
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

const AddSSORate = async (req, res) => {
    try {
        const { ssoRate } = req.body;
        if (!ssoRate) {
            return res.status(400).send({
                success: false,
                message: "Please provide SSO Rate"
            })
        }
        const [rows, fields] = await db.execute(
            `INSERT into tb_sso_rate (rate) values (?)`,
            [ssoRate])

        return res.status(200).send({
            success: true,
            message: "SSO Rate Updated Successfully",
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

const AddWHTRate = async (req, res) => {
    try {
        const { WHTRate } = req.body;
        console.log(req.body);

        if (!WHTRate) {
            return res.status(400).send({
                success: false,
                message: "Please provide WHT Rate"
            })
        }
        const [rows, fields] = await db.execute(
            `INSERT into tb_WHT_rate (rate) values (?)`,
            [WHTRate])

        return res.status(200).send({
            success: true,
            message: "WHT Rate Updated Successfully",
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

const AddtDailyRate = async (req, res) => {
    try {
        const { DailyRate, employees } = req.body;
        console.log(req.body);

        if (!DailyRate) {
            return res.status(400).send({
                success: false,
                message: "Please provide Daily Rate"
            })
        }
        const [rows, fields] = await db.execute(
            `INSERT into tb_Daily_Rate (rate) values (?)`,
            [DailyRate])

        if (!Array.isArray(employees) || employees.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Employees must be provided as a non-empty array."
            });
        }

        const results = [];
        for (const id of employees) {
            console.log(id);
            
            const [updaterows] = await db.execute(
                `UPDATE tb_contract SET basic_salary = ? WHERE employee_id = ?`,
                [DailyRate, id]
            );
            results.push({ employee_id: id, affectedRows: updaterows.affectedRows });
        }
        return res.status(200).send({
            success: true,
            message: "Daily Rate Updated Successfully",
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

const AddOverTime = async (req, res) => {
    try {
        const { OverTimeRate, employees } = req.body;
        console.log(req.body);

        if (!OverTimeRate) {
            return res.status(400).send({
                success: false,
                message: "Please provide OverTime Rate"
            })
        }
        const [rows, fields] = await db.execute(
            `INSERT into tbl_over_time (rate) values (?)`,
            [OverTimeRate])
        if (!Array.isArray(employees) || employees.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Employees must be provided as a non-empty array."
            });
        }

        const results = [];
        for (const id of employees) {
            console.log(id);
            
            const [updaterows] = await db.execute(
                `UPDATE tb_contract SET ot_rate = ? WHERE employee_id = ?`,
                [OverTimeRate, id]
            );
            results.push({ employee_id: id, affectedRows: updaterows.affectedRows });
        }
        return res.status(200).send({
            success: true,
            message: "OverTime Rate Updated Successfully",
            data: rows
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
}
const getLatestSSORate = async (req, res) => {
    try {
        // Correct query to fetch the latest SSO rate
        const [existingSSO] = await db.execute(
            `SELECT * FROM tb_sso_rate ORDER BY id DESC LIMIT 1`
        );

        const [existingWHT] = await db.execute(
            `SELECT * FROM tb_WHT_rate ORDER BY id DESC LIMIT 1`
        );

        const [existingOverTime] = await db.execute(
            `SELECT * FROM tbl_over_time ORDER BY id DESC LIMIT 1`
        );

        const [existingDailyRate] = await db.execute(
            `SELECT * FROM tb_Daily_Rate ORDER BY id DESC LIMIT 1`
        );

        return res.status(200).send({
            success: true,
            message: "SSO Rate fetched successfully",
            data: existingSSO?.[0] || {},
            existingWHT: existingWHT?.[0] || {},
            existingOverTime: existingOverTime?.[0] || {},
            existingDailyRate: existingDailyRate?.[0] || {}
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
}


module.exports = { GetAllcontract, Addcontract, Updatecontract, GetcontractById, Deletecontract, AddSSORate, AddWHTRate, AddtDailyRate, AddOverTime, getLatestSSORate }
