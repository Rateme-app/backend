const express = require("express")
const router = express.Router()
const MusicController = require("../controllers/music-controller")

router.route("/")
    .get(MusicController.getAll)

module.exports = router
