const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

const GetMenu = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT m.id as menu_id,
            m.name as name,
            m.url as url,
            m.icon as icon,
            m.sort as sort,
            m.status as status,
            m.position as position,
            m.deleted as deleted,
            m.created_at as created_at
            FROM tb_menu as m
            WHERE m.deleted='${0}'
            ORDER BY m.created_at DESC`,
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


module.exports = { GetMenu }
