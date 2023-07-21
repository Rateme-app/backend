const mongoose = require("mongoose")

const MessageSchema = new mongoose.Schema(
    {
        description: {type: String, required: true},
        date: {type: Date, default: Date.now},
        senderConversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },
        receiverConversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },
    },
    {
        timestamps: {currentTime: () => Date.now()},
    }
)
module.exports = mongoose.model("Message", MessageSchema)
