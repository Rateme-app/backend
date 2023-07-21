const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

exports.getMyConversations = async (req, res) => {
    try {
        const {senderId} = req.params;
        const conversations = await Conversation.find({sender: senderId}).populate("sender receiver");
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({error: "Failed to fetch conversations"});
    }
};

exports.getMyMessages = async (req, res) => {
    try {
        const {conversationId} = req.params;
        const messages = await Message.find({
            $or: [{senderConversation: conversationId}, {receiverConversation: conversationId}],
        }).populate("senderConversation receiverConversation");
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({error: "Failed to fetch messages"});
    }
};

exports.createConversation = async (req, res) => {
    try {
        const {sender, receiver} = req.body;
        let senderConversation = await Conversation.findOne({sender, receiver});
        if (!senderConversation) {
            senderConversation = new Conversation({sender, receiver});
        }
        senderConversation.lastMessage = "conversation vide";
        senderConversation.lastMessageDate = Date();
        let conversation = await senderConversation.save();
        res.status(200).json(await conversation.populate("sender receiver"));
    } catch (error) {
        res.status(500).json({error: "Failed to create conversation"});
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const {description, sender, receiver} = req.body;

        const senderConversation = await Conversation.findOne({sender, receiver}) || new Conversation({
            sender,
            receiver
        });
        senderConversation.lastMessage = description;
        senderConversation.lastMessageDate = Date();
        await senderConversation.save();

        const receiverConversation = await Conversation.findOne({
            sender: receiver,
            receiver: sender
        }) || new Conversation({sender: receiver, receiver: sender});
        receiverConversation.lastMessage = description;
        receiverConversation.lastMessageDate = Date();
        await receiverConversation.save();

        const newMessage = new Message({
            description,
            senderConversation: senderConversation._id,
            receiverConversation: receiverConversation._id
        });
        await newMessage.save();


        res.status(200).json(await newMessage.populate("senderConversation receiverConversation"));
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Failed to send message"});
    }
};

exports.deleteConversation = async (req, res) => {
    try {
        const {conversationId} = req.params;
        const conversation = await Conversation.findByIdAndRemove(conversationId);
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({error: "Failed to delete conversation"});
    }
};