const bcrypt = require("bcryptjs")
const moment = require("moment")
const { db } = require("../../db/db2")
const sendMail = require('../../helpers/sendMail');

const adminLogin = async (req, res) => {
	const password = req.body.password

	try {
		if (!req.body.email || req.body.email == " " || req.body.email == null)
			throw new Error("email is empty!")
		if (
			!req.body.password ||
			req.body.password == " " ||
			req.body.password == null
		)
			throw new Error("password is empty!")

		const [rows, fields] = await db.execute(
			"SELECT * FROM users WHERE email = ? and is_deleted=?",
			[req.body.email, 0],
		)
		if (!rows.length) throw new Error("Username Incorrect")

		const user = rows[0];

		// Check if the user's status is Inactive
		if (user.status !== 'active') {
			throw new Error("Account is Banned. Please contact support.");
		}

		if (!(await bcrypt.compareSync(password, rows[0].password)))
			throw new Error("Username Or Password Incorrect")
		await db.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [
			rows[0].id,
		])
		return res.status(200).send({
			success: true,
			message: "Login Successfully",
			user: { ...rows[0], password: undefined },
		})
	} catch (err) {
		return res.status(500).send({
			success: false,
			message: err.message,
		})
	}
}

const getUsers = async (req, res) => {
	try {
		const [rows, fields] = await db.execute(
			`SELECT u.id as id,
			u.role as role,
			u.name as name,
			u.email as email,
			u.email_verified_at as email_verified_at,
			u.remember_token as remember_token,
			u.status as status,
			u.last_login as last_login,
			u.is_deleted as is_deleted,
			u.created_at as created_at
			FROM users as u
			where u.is_deleted='${0}'`
		)
		return res.status(200).send({
			success: true,
			data: rows
		})
	} catch (error) {
		return res.status(500).send({
			success: false,
			message: error.message,  // 'err' is undefined, should be 'error'
		})
	}
}


const CreateUsers = async (req, res) => {
	try {
		const { role, status, name, email, password } = req.body;
		if (!role || !status || !name || !email || !password) {
			return res.status(400).send({
				success: false,
				message: "All fields are required"
			})
		}
		var hash = bcrypt.hashSync(password, 8);

		const [rows, fields] = await db.execute(
			`INSERT into users (role, status, name, email, password ) values (?,?,?,?,?)`,
			[role, status, name, email, hash])

		return res.status(200).send({
			success: true,
			message: "User Created Successfully",
			data: rows
		})
	} catch (error) {
		return res.status(500).send({
			success: false,
			message: err.message,
		})
	}
}

const UpdateUsers = async (req, res) => {
	try {
		const { id, role, status, name } = req.body;
		if (!role || !status || !name) {
			return res.status(400).send({
				success: false,
				message: "All fields are required"
			})
		}

		const [rows, fields] = await db.execute(
			`Update users SET role=?, status=?, name=? where id=?`,
			[role, status, name, id])

		return res.status(200).send({
			success: true,
			message: "User Updated Successfully",
			data: rows
		})
	} catch (error) {
		return res.status(500).send({
			success: false,
			message: err.message,
		})
	}
}

const UserReset = async (req, res) => {
	try {
		const { id, password, email } = req.body;
		var hash = bcrypt.hashSync(password, 8);
		if (email) {
			// Update both user_name and password
			const [rows, fields] = await db.execute(
				`UPDATE users SET email=?, password=? WHERE id = ?`,
				[email, hash, id])
		} else {
			// Update only password
			const [rows, fields] = await db.execute(
				`UPDATE users SET password=? WHERE id = ?`,
				[hash, id])
		}
		return res.status(200).send({
			success: true,
			message: "User reset Successfully"
		});
	} catch (error) {
		return res.status(500).send({
			success: false,
			message: err.message,
		})
	}
};

const DeleteUser = async (req, res) => {
	try {
		const { id } = req.body;

		// Check if the employee exists
		const [existingEmployee] = await db.execute(
			`SELECT * FROM users WHERE id = ? and is_deleted=?`,
			[id, 0]
		);

		if (existingEmployee.length === 0) {
			return res.status(400).send({
				success: false,
				message: "User not found."
			});
		}

		// Delete the employee
		const [rows] = await db.execute(
			`Update users SET is_deleted=? WHERE id = ?`,
			[1, id]
		);

		return res.status(200).send({
			success: true,
			message: "User Deleted Successfully",
			data: rows
		});
	} catch (err) {
		return res.status(500).send({
			success: false,
			message: err.message
		});
	}
};

module.exports = { adminLogin, getUsers, CreateUsers, UpdateUsers, UserReset }
