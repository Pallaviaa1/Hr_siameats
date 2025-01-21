const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');
const { log } = require("winston");

const GetAllAttendance = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT 
            a.id as id, 
            a.employee_id as employee_id,
            a.workday as workday,
            a.morning_in as morning_in,
            a.lunch_break_out as lunch_break_out,
            a.lunch_break_in as lunch_break_in,
            a.afternoon_out as afternoon_out,
            a.sort as sort,
            a.hours_worked as hours_worked,
            a.day_worked as day_worked,
            a.overtime as overtime,
            a.overtime_break as overtime_break,
            a.Unworked_Day as Unworked_Day,
            a.update_at as update_at,
            a.created_at as created_at,
            e.id as Employee_id,
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
            e.sick_date as sick_date
            FROM tb_attendance as a
            LEFT JOIN tb_employee as e ON e.id=a.employee_id
            WHERE a.is_deleted='${0}'
            ORDER BY a.id DESC`,
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

/* const CreateAttendance = async (req, res) => {
    try {
        const { employee_id, working_day, Work_time_morning, lunch_break_out, lunch_break_in, afternoon_out, overtime_break, hours_worked, day_worked, overtime } = req.body;

        const [existingRecord] = await db.execute(
            `SELECT id FROM tb_attendance WHERE employee_id = ? AND workday = ?`,
            [employee_id, working_day]
        );

        if (existingRecord.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Attendance record already exists for the given employee and working day."
            });
        }

        // Insert new attendance record
        const [rows] = await db.execute(
            `INSERT INTO tb_attendance 
            (employee_id, workday, morning_in, lunch_break_out, lunch_break_in, afternoon_out, overtime_break, hours_worked, day_worked, overtime) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                employee_id,
                working_day,
                Work_time_morning,
                lunch_break_out,
                lunch_break_in,
                afternoon_out,
                overtime_break,
                hours_worked,
                day_worked,
                overtime
            ]
        );

        return res.status(200).send({
            success: true,
            message: "Attendance added successfully.",
            data: rows
        });

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        })
    }
} */

const CreateAttendance = async (req, res) => {
    try {
        const {
            employee_id,
            working_day,
            Work_time_morning,
            lunch_break_out,
            lunch_break_in,
            afternoon_out,
            overtime_break,
            hours_worked,
            day_worked,
            overtime
        } = req.body;

        // Check if attendance already exists for the employee on the given working day
        const [existingRecord] = await db.execute(
            `SELECT id FROM tb_attendance WHERE employee_id = ? AND workday = ? AND is_deleted=?`,
            [employee_id, working_day, 9]
        );

        if (existingRecord.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Attendance record already exists for the given employee and working day."
            });
        }
        console.log(working_day);

        // Check if the employee has any vacation on the given working day
        const [vacation] = await db.execute(
            `SELECT leaves_id FROM tb_vacation WHERE employee_id = ? AND ? BETWEEN start_date AND end_date`,
            [employee_id, working_day]
        );
        console.log(vacation);

        // Determine the value of Unworked_Day
        let Unworked_Day = 0;
        if (vacation.length > 0) {
            Unworked_Day = vacation[0].leaves_id === 3 ? 3 : 0;
        }

        // Insert a new attendance record
        const [rows] = await db.execute(
            `INSERT INTO tb_attendance 
                (employee_id, workday, morning_in, lunch_break_out, lunch_break_in, afternoon_out, overtime_break, hours_worked, day_worked, overtime, Unworked_Day) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                employee_id,
                working_day,
                Work_time_morning,
                lunch_break_out,
                lunch_break_in,
                afternoon_out,
                overtime_break,
                hours_worked,
                day_worked,
                overtime,
                Unworked_Day
            ]
        );

        return res.status(200).send({
            success: true,
            message: "Attendance added successfully.",
            data: rows
        });

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};


/* const CreateAllAttendance = async (req, res) => {
    try {
        const {
            working_day,
            Work_time_morning,
            lunch_break_out,
            lunch_break_in,
            afternoon_out,
            overtime_break,
            hours_worked,
            day_worked,
            overtime
        } = req.body;
        console.log(req.body);

        // Fetch all employees with status 'on'
        const [employees] = await db.execute(
            `SELECT id FROM tb_employee WHERE status = 'on' and is_deleted='0'`
        );

        if (employees.length === 0) {
            return res.status(400).send({
                success: false,
                message: "No active employees found."
            });
        }

        for (const employee of employees) {
            const employee_id = employee.id;

            // Check if attendance already exists for the working day
            const [existingAttendance] = await db.execute(
                `SELECT id FROM tb_attendance WHERE employee_id = ? AND workday = ?`,
                [employee_id, working_day]
            );

            if (existingAttendance.length > 0) {
                // Update the existing attendance record
                await db.execute(
                    `UPDATE tb_attendance SET 
                        morning_in = ?, 
                        lunch_break_out = ?, 
                        lunch_break_in = ?, 
                        afternoon_out = ?, 
                        overtime_break = ?, 
                        hours_worked = ?, 
                        day_worked = ?, 
                        overtime = ? 
                    WHERE employee_id = ? AND workday = ?`,
                    [
                        Work_time_morning,
                        lunch_break_out,
                        lunch_break_in,
                        afternoon_out,
                        overtime_break,
                        hours_worked,
                        day_worked,
                        overtime,
                        employee_id,
                        working_day
                    ]
                );
            } else {
                // Insert a new attendance record
                await db.execute(
                    `INSERT INTO tb_attendance 
                        (employee_id, workday, morning_in, lunch_break_out, lunch_break_in, afternoon_out, overtime_break, hours_worked, day_worked, overtime) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        employee_id,
                        working_day,
                        Work_time_morning,
                        lunch_break_out,
                        lunch_break_in,
                        afternoon_out,
                        overtime_break,
                        hours_worked,
                        day_worked,
                        overtime
                    ]
                );
            }
        }

        const [attendanceList] = await db.execute(
            `SELECT a.*, 
       e.f_name AS f_name, 
       e.l_name AS l_name,
       e.n_name AS n_name 
       FROM tb_attendance AS a
       LEFT JOIN tb_employee AS e ON e.id = a.employee_id
       WHERE workday = ?`,
            [working_day]
        );

        return res.status(200).send({
            success: true,
            message: "Attendance processed successfully for all employees.",
            data: attendanceList
        });

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
}; */

const CreateAllAttendance = async (req, res) => {
    try {
        const {
            working_day,
            Work_time_morning,
            lunch_break_out,
            lunch_break_in,
            afternoon_out,
            overtime_break,
            hours_worked,
            day_worked,
            overtime
        } = req.body;

        console.log(req.body);

        // Fetch all employees with status 'on'
        const [employees] = await db.execute(
            `SELECT id FROM tb_employee WHERE status = 'on' AND is_deleted = '0'`
        );

        if (employees.length === 0) {
            return res.status(400).send({
                success: false,
                message: "No active employees found."
            });
        }

        for (const employee of employees) {
            const employee_id = employee.id;

            // Check if there is any vacation for this employee on the working day
            const [vacation] = await db.execute(
                `SELECT leaves_id FROM tb_vacation WHERE employee_id = ? AND ? BETWEEN start_date AND end_date`,
                [employee_id, working_day]
            );

            // Determine Unworked_Day based on vacation leave_id
            let Unworked_Day = 0;
            if (vacation.length > 0) {
                Unworked_Day = vacation[0].leaves_id === 3 ? 3 : 0;
            }

            // Check if attendance already exists for the working day
            const [existingAttendance] = await db.execute(
                `SELECT id FROM tb_attendance WHERE employee_id = ? AND workday = ? AND is_deleted=?`,
                [employee_id, working_day, 0]
            );

            if (existingAttendance.length > 0) {
                // Update the existing attendance record
                await db.execute(
                    `UPDATE tb_attendance SET 
                        morning_in = ?, 
                        lunch_break_out = ?, 
                        lunch_break_in = ?, 
                        afternoon_out = ?, 
                        overtime_break = ?, 
                        hours_worked = ?, 
                        day_worked = ?, 
                        overtime = ?, 
                        Unworked_Day = ?
                    WHERE employee_id = ? AND workday = ?`,
                    [
                        Work_time_morning,
                        lunch_break_out,
                        lunch_break_in,
                        afternoon_out,
                        overtime_break,
                        hours_worked,
                        day_worked,
                        overtime,
                        Unworked_Day,
                        employee_id,
                        working_day
                    ]
                );
            } else {
                // Insert a new attendance record
                await db.execute(
                    `INSERT INTO tb_attendance 
                        (employee_id, workday, morning_in, lunch_break_out, lunch_break_in, afternoon_out, overtime_break, hours_worked, day_worked, overtime, Unworked_Day)  
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        employee_id,
                        working_day,
                        Work_time_morning,
                        lunch_break_out,
                        lunch_break_in,
                        afternoon_out,
                        overtime_break,
                        hours_worked,
                        day_worked,
                        overtime,
                        Unworked_Day
                    ]
                );
            }
        }

        const [attendanceList] = await db.execute(
            `SELECT a.*, 
       e.f_name AS f_name, 
       e.l_name AS l_name,
       e.n_name AS n_name 
       FROM tb_attendance AS a
       LEFT JOIN tb_employee AS e ON e.id = a.employee_id
       WHERE workday = ?`,
            [working_day]
        );

        return res.status(200).send({
            success: true,
            message: "Attendance processed successfully for all employees.",
            data: attendanceList
        });

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

const getNewAttendance = async (req, res) => {
    try {
        const { working_day } = req.query;
        const [attendanceList] = await db.execute(
            `SELECT a.*, 
       e.f_name AS f_name, 
       e.l_name AS l_name,
       e.n_name AS n_name 
       FROM tb_attendance AS a
       LEFT JOIN tb_employee AS e ON e.id = a.employee_id
       WHERE workday = ?`,
            [working_day]
        );

        return res.status(200).send({
            success: true,
            message: "Attendance processed successfully for all employees.",
            data: attendanceList
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

const UpdateAttendance = async (req, res) => {
    try {
        const {
            attendance_id,
            employee_id,
            working_day,
            Work_time_morning,
            lunch_break_out,
            lunch_break_in,
            afternoon_out,
            overtime_break,
            hours_worked,
            day_worked,
            overtime
        } = req.body;

        // Check if the attendance record exists
        const [existingAttendance] = await db.execute(
            `SELECT * FROM tb_attendance WHERE id = ?`,
            [attendance_id]
        );

        if (existingAttendance.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Attendance record not found."
            });
        }

        // Update the attendance details
        const [rows] = await db.execute(
            `UPDATE tb_attendance SET 
                employee_id = ?, 
                workday = ?, 
                morning_in = ?, 
                lunch_break_out = ?, 
                lunch_break_in = ?, 
                afternoon_out = ?, 
                overtime_break = ?,
                hours_worked=?,
                day_worked=?,
                overtime=?
                 WHERE id = ?`,
            [
                employee_id,
                working_day,
                Work_time_morning,
                lunch_break_out,
                lunch_break_in,
                afternoon_out,
                overtime_break,
                hours_worked,
                day_worked,
                overtime,
                attendance_id
            ]
        );

        return res.status(200).send({
            success: true,
            message: "Attendance Updated Successfully",
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

const DeleteAttendance = async (req, res) => {
    try {
        const { attendance_id } = req.body;

        // Check if the attendance record exists
        const [existingAttendance] = await db.execute(
            `SELECT * FROM tb_attendance WHERE id = ? and is_deleted=?`,
            [attendance_id, 0]
        );

        if (existingAttendance.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Attendance record not found."
            });
        }

        // Delete the attendance record
        const [rows] = await db.execute(
            `Update tb_attendance SET is_deleted=? WHERE id = ?`,
            [1, attendance_id]
        );

        return res.status(200).send({
            success: true,
            message: "Attendance Deleted Successfully",
            data: rows
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

const updateWeekDay = async (req, res) => {
    try {
        const { attendance_id } = req.body;
        // console.log(req.body);


        const [existingAttendance] = await db.execute(
            `SELECT Unworked_Day FROM tb_attendance WHERE id = ? and is_deleted=?`,
            [attendance_id, 0]
        );

        if (existingAttendance.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Attendance record not found."
            });
        }
        // console.log(existingAttendance);

        const UpdateWorkedDay = existingAttendance[0].Unworked_Day === 3 ? 0 : 3
        // console.log(UpdateWorkedDay);

        const [rows] = await db.execute(
            `Update tb_attendance SET Unworked_Day=? WHERE id = ?`,
            [UpdateWorkedDay, attendance_id]
        );
        return res.status(200).send({
            success: true,
            message: "Attendance status changed."
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

module.exports = { GetAllAttendance, CreateAttendance, CreateAllAttendance, getNewAttendance, UpdateAttendance, DeleteAttendance, updateWeekDay }
