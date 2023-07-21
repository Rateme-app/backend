let Post = require("../models/Post")
let Comment = require("../models/Comment")

exports.getAll = async (req, res) => {
    const posts = await Post.find().populate('likes comments user');

    const populatedPosts = await Promise.all(posts.map(async (post) => {
        const populatedComments = await Comment.populate(post.comments, {path: 'user'});
        return {...post.toObject(), comments: populatedComments};
    }));

    res.status(200).json(populatedPosts)
}

exports.add = async (req, res) => {
    const {title, description, userId} = req.body

    let videoFilename;
    if (req.file) {
        videoFilename = req.file.filename
    }

    let post = await new Post({
        title,
        description,
        videoFilename,
        user: userId,
    }).save()

    return res.status(200).json(post.populate("likes comments user"));
}


exports.delete = async (req, res) => {
    await Post.findById(req.params.id)
        .then(function (post) {
            post.remove()

            res.status(200).json({message: "Post deleted successfully"})
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json({error})
        })
}
