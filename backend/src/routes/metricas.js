const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { identificarUsuarioOpcional } = require("../middleware/auth");

router.post("/visitas", identificarUsuarioOpcional, async (req, res) => {
    const ruta = typeof req.body.ruta === "string" ? req.body.ruta.trim() : "";

    if (ruta === "") {
        return res.status(400).json({ ok:false, error: "Falta el campo 'ruta'." });
    }

    const usuarioId = req.user ? req.user.id : null;

    try {
        await db.query(
            "INSERT INTO visitas (ruta, usuario_id) VALUES ($1, $2)",
            [ruta, usuarioId]
        );
        console.log(`📊 Visita registrada: ${ruta}`);
        return res.status(201).end();
    } catch (error) {
        console.error("Error al registrar visita:", error);
        return res.status(500).json({ ok: false, error: "No se pudo registrar la visita."});
    }
});

module.exports = router; 
