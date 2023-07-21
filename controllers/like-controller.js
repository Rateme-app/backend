const Like = require("../models/Like")
const Post = require("../models/Post")

exports.getAll = async (req, res) => {
    res.status(200).json(await Like.find())
}

exports.addOrRemove = async (req, res) => {
    let like = await Like.findOne({user: req.body.user, post: req.body.post})
    let post = await Post.findById(req.body.post)

    if (like) {
        console.log("remove like")
        await Post.findByIdAndUpdate(
            {_id: req.body.post},
            {
                $pull: {
                    likes: [like._id],
                },
            }
        )

        await like.remove()
    } else {
        console.log("add like")

        like = new Like(req.body)
        post = await Post.findById(req.body.post).populate("likes")

        await Post.findByIdAndUpdate({
                _id: req.body.post
            },
            {
                $push: {
                    likes: like._id,
                },
            }
        )

        await like.save()
    }

    res.status(200).json(post)
}