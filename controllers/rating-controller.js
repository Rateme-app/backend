const Rating = require("../models/Rating");

exports.getAll = async (req, res) => {
    res.status(200).json(await Rating.find().populate("liker liked"));
};

exports.addOrUpdate = async (req, res) => {
    const ratingData = req.body;
    const liker = ratingData.liker._id;
    const liked = ratingData.liked._id;

    const existingRating = await Rating.findOne({liker, liked});

    if (existingRating) {
        // Update an existing rating
        existingRating.value = ratingData.value;
        existingRating.save();
        const populatedRating = await existingRating.populate("liker liked");

        res.status(200).json(populatedRating);
    } else {
        // Add a new rating
        const newRating = await new Rating(ratingData).save();
        const populatedRating = await newRating.populate("liker liked");

        res.status(200).json(populatedRating);
    }
};
