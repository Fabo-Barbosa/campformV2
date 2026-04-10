const express = require('express');
const router = express.Router();

router.get('/nova', (req, res) => {
    res.render("campanha/formulario")
})

module.exports = router;