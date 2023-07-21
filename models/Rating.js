const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        description: {type: String, required: true},
        date: {type: Date, required: true},
        value: {type: Number, required: true},
        liker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        liked: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: {currentTime: () => Date.now()}
    }
);

module.exports = mongoose.model("Rating", schema);
