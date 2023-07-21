const express = require("express")
const router = express.Router()
const PostController = require("../controllers/post-controller")
const upload = require('../middlewares/storage-videos')

router.route("/")
    .get(PostController.getAll)
    .post(upload.single('video'), PostController.add)

router.route("/:id")
    .delete(PostController.delete)

module.exports = router