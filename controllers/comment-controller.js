const Comment = require("../models/Comment")
const User = require("../models/User")
const Post = require("../models/Post")

exports.getAll = async (req, res) => {
    res.status(200).json(await Comment.find().populate("user"))
}

exports.add = async (req, res) => {
    let comment = await new Comment(req.body).save()

    await Post.findByIdAndUpdate({
            _id: comment.post
        },
        {
            $push: {
                comments: comment._id,
            },
        }
    )

    res.status(200).json(comment.populate("user"))
}

exports.deleteAllComment = async (req, res) => {
    Comment.remove({}, function (err) {
        if (err) {
            return handleError(res, err)
        }
        return res.status(204).json({message: "Aucun element"})
    })
}