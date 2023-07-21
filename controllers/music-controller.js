let Music = require("../models/Music")

exports.getAll = async (req, res) => {
    res.status(200).json(await Music.find())
}