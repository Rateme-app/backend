const express = require("express")
const router = express.Router()
const userController = require("../controllers/user-controller");
const upload = require('../middlewares/storage-images');

router.route("/").get(userController.getAll)
router.route("/:id").get(userController.get)

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/login-with-social", userController.loginWithSocial);
router.post("/send-confirmation-email", userController.sendConfirmationEmail);
router.get("/confirmation/:token", userController.confirmation);
router.post("/forgot-password", userController.forgotPassword);
router.put("/update-profile", userController.updateProfile);
router.post("/update-profile-picture", upload.single('picture'), userController.updateProfilePicture);
router.put("/update-password", userController.updatePassword);

router.route("/one").delete(userController.delete);

module.exports = router