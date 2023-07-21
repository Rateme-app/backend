const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/chat-controller");

router.get("/my-conversations/:senderId", MessageController.getMyConversations);
router.get("/my-messages/:conversationId", MessageController.getMyMessages);
router.post("/create-conversation", MessageController.createConversation);
router.post("/send-message", MessageController.sendMessage);
router.delete("/:conversationId", MessageController.deleteConversation);

module.exports = router;