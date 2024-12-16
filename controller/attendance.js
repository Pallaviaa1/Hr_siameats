const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

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
            a.afternoon_out as day_worked,
            a.sort as overtime,
            a.hours_worked as overtime_break,
            a.sort as update_at,
            a.hours_worked as created_at,
            e.id as employee_id,
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
            ORDER BY a.created_at DESC`,
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

const CreateAttendance = async (req, res) => {
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
}

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
                `SELECT id FROM tb_attendance WHERE employee_id = ? AND working_day = ?`,
                [employee_id, working_day]
            );

            if (existingAttendance.length > 0) {
                // Update the existing attendance record
                await db.execute(
                    `UPDATE tb_attendance SET 
                        Work_time_morning = ?, 
                        lunch_break_out = ?, 
                        lunch_break_in = ?, 
                        afternoon_out = ?, 
                        overtime_break = ?, 
                        hours_worked = ?, 
                        day_worked = ?, 
                        overtime = ? 
                    WHERE employee_id = ? AND working_day = ?`,
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
                        (employee_id, workday, Work_time_morning, lunch_break_out, lunch_break_in, afternoon_out, overtime_break, hours_worked, day_worked, overtime) 
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
            `SELECT * FROM tb_attendance WHERE working_day = ?`,
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
            overtime_break
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
                working_day = ?, 
                Work_time_morning = ?, 
                lunch_break_out = ?, 
                lunch_break_in = ?, 
                afternoon_out = ?, 
                overtime_break = ? 
            WHERE id = ?`,
            [
                employee_id,
                working_day,
                Work_time_morning,
                lunch_break_out,
                lunch_break_in,
                afternoon_out,
                overtime_break,
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
            `SELECT * FROM tb_attendance WHERE id = ? and is_deleted=0`,
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

module.exports = { GetAllAttendance, CreateAttendance, CreateAllAttendance, UpdateAttendance, DeleteAttendance }
