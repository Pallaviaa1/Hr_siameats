const bcrypt = require("bcryptjs")
const { db } = require("../db/db2")
const sendMail = require('../helpers/sendMail');

const GetMenu = async (req, res) => {
    try {
        const [rows, fields] = await db.execute(
            `SELECT m.id as menu_id,
            m._id as _id,
            m.name as name,
            m.url as url,
            m.icon as icon,
            m.sort as sort,
            m.status as status,
            m.position as position,
            m.deleted as deleted,
            m.created as created
            FROM tb_menu as m
            WHERE m.deleted='${0}'
            ORDER BY m.created DESC`,
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

const AddMenu = async (req, res) => {
    const { name, _id, url, icon, position } = req.body;

    if (!name || !url || !position) {
        return res.status(400).send({
            success: false,
            message: "Name and URL are required fields.",
        });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO tb_menu (name, url, icon, _id, position)
            VALUES (?, ?, ?, ?, ?)`,
            [name, url, icon || null, _id || null, position || null]
        );
        return res.status(201).send({
            success: true,
            message: "Menu item added successfully.",
            menu_id: result.insertId,
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};

const UpdateMenu = async (req, res) => {

    const { menu_id, _id, name, url, icon, position } = req.body;

    if (!menu_id) {
        return res.status(400).send({
            success: false,
            message: "Menu ID is required.",
        });
    }

    try {
        const [result] = await db.execute(
            `UPDATE tb_menu
            SET name = ?, _id=?, url = ?, icon = ?, position = ?
            WHERE id = ? AND deleted = 0`,
            [name || null, _id || null, url || null, icon || null, position || null, menu_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: "Menu item not found or already deleted.",
            });
        }

        return res.status(200).send({
            success: true,
            message: "Menu item updated successfully.",
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};

const DeleteMenu = async (req, res) => {
    const { menu_id } = req.body;

    if (!menu_id) {
        return res.status(400).send({
            success: false,
            message: "Menu ID is required.",
        });
    }

    try {
        const [result] = await db.execute(
            `UPDATE tb_menu
            SET deleted = 1
            WHERE id = ? AND deleted = 0`,
            [menu_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: "Menu item not found or already deleted.",
            });
        }

        return res.status(200).send({
            success: true,
            message: "Menu item deleted successfully.",
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};

const ChangeMenuStatus = async (req, res) => {
    const { menu_id } = req.body;

    if (!menu_id) {
        return res.status(400).send({
            success: false,
            message: "Menu ID is required.",
        });
    }

    try {
        // Fetch current status
        const [menu] = await db.execute(
            `SELECT status FROM tb_menu WHERE id = ? AND deleted = 0`,
            [menu_id]
        );

        if (menu.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Menu item not found or already deleted.",
            });
        }

        // Determine new status
        const currentStatus = menu[0].status;
        const newStatus = currentStatus === "on" ? "off" : "on";

        // Update status
        const [result] = await db.execute(
            `UPDATE tb_menu
            SET status = ?
            WHERE id = ?`,
            [newStatus, menu_id]
        );

        return res.status(200).send({
            success: true,
            message: `Menu status changed to ${newStatus}.`,
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};


module.exports = { GetMenu, AddMenu, UpdateMenu, DeleteMenu, ChangeMenuStatus }
