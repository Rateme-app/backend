const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const os = require("os")

exports.get = async (req, res) => {
    res.status(200).json(await User.findById(req.params.id))
}

exports.getAll = async (req, res) => {
    res.status(200).json(await User.find())
}

exports.register = async (req, res) => {
    const {username, email, password, firstname, lastname, birthdate, gender, bio} = req.body

    if (await User.findOne({email})) {
        res.status(403).json({message: "User already exist !"})
    } else {
        let user = await new User({
            username,
            email,
            password: await bcrypt.hash(password, 10),
            firstname,
            lastname,
            birthdate,
            gender,
            bio,
            isVerified: false,
            role: "ROLE_USER",
        })

        await user.save();

        // token creation
        const token = generateUserToken(user)

        await doSendConfirmationEmail(email, token, req.protocol)

        res.status(200).json(user)
    }
}

exports.login = async (req, res) => {
    const {email, password} = req.body

    const user = await User.findOne({email})

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = generateUserToken(user)

        if (!user.isVerified) {
            res.status(403).json({user, message: "email non verifié"})
        } else {
            res.status(200).json(user)
        }
    } else {
        res.status(403).json({message: "mot de passe ou email incorrect"})
    }
}

exports.loginWithSocial = async (req, res) => {
    const {email, firstname, lastname} = req.query

    if (email === "") {
        res.status(403).json({message: "error please provide an email"})
    } else {
        let user = await User.findOne({email});
        if (user) {
            console.log("user exists, loging in")
        } else {
            console.log("user does not exists, creating an account")

            user = await new User({
                email,
                username: firstname,
                firstname,
                lastname,
                password: await bcrypt.hash("0000", 10),
                isVerified: true,
                role: "ROLE_USER",
            }).save()
        }

        res.status(200).json(user)
    }
}

exports.sendConfirmationEmail = async (req, res) => {

    const user = await User.findOne({email: req.body.email})

    if (user) {
        token = generateUserToken(user)

        await doSendConfirmationEmail(req.body.email, token, req.protocol)

        res.status(200).json({
            message: "L'email de confirmation a été envoyé a " + user.email,
        })
    } else {
        res.status(404).json({message: "User innexistant"})
    }
}

exports.confirmation = async (req, res) => {
    if (req.params.token) {
        try {
            token = jwt.verify(req.params.token, process.env.JWT_SECRET)
        } catch (e) {
            return res.render("confirmation.twig", {
                message:
                    "The verification link may have expired, please resend the email.",
            })
        }
    } else {
        return res.render("confirmation.twig", {
            message: "no token",
        })
    }

    User.findById(token.user._id, function (err, user) {
        if (!user) {
            return res.render("confirmation.twig", {
                message: "User does not exist, please register.",
            })
        } else if (user.isVerified) {
            return res.render("confirmation.twig", {
                message: "This user has already been verified, please login",
            })
        } else {
            user.isVerified = true
            user.save(function (err) {
                if (err) {
                    return res.render("confirmation.twig", {
                        message: err.message,
                    })
                } else {
                    return res.render("confirmation.twig", {
                        message: "Your account has been verified",
                    })
                }
            })
        }
    })
}

exports.forgotPassword = async (req, res) => {
    const resetCode = req.body.resetCode
    const user = await User.findOne({email: req.body.email})

    if (user) {
        // token creation
        await sendOTP(req.body.email, resetCode)

        res.status(200).json({
            message: "L'email de reinitialisation a été envoyé a " + user.email,
        })
    } else {
        res.status(404).json({message: "User innexistant"})
    }
}

exports.updateProfile = async (req, res) => {
    try {
        let user = await User.findOneAndUpdate(
            {email: req.body.email},
            {
                $set: {
                    ...(req.body), // Spread the req.body properties
                },
            },
            {new: true} // To return the updated user object
        );

        return res.status(200).json(user);
    } catch (error) {
        // Handle any errors that occur during the update process
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
};

exports.updateProfilePicture = async (req, res) => {
    try {
        let user = await User.findByIdAndUpdate(
            req.body.userId,
            {
                $set: {
                    imageFilename: req.file.filename,
                },
            },
            {new: true}
        );

        return res.status(200).json(user);
    } catch (error) {
        // Handle any errors that occur during the update process
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
};


exports.updatePassword = async (req, res) => {
    const {email, newPassword} = req.body

    if (newPassword) {
        newPasswordEncrypted = await bcrypt.hash(newPassword, 10)

        let user = await User.findOneAndUpdate(
            {email: email},
            {
                $set: {
                    password: newPasswordEncrypted,
                },
            }
        )

        return res.status(200).json(user)
    } else {
        return res.status(403).json({message: "Password should not be empty"})
    }
}

exports.delete = async (req, res) => {
    let user = await User.findById(req.body._id)
    if (user) {
        await user.remove()
        return res.status(200).json({message: "Users" + user._id + " have been deleted"})
    } else {
        return res.status(404).json({message: "User does not exist"})
    }
}

///// FUNCTIONS ---------------------------------------------------------

function generateUserToken(user) {
    return jwt.sign({user}, process.env.JWT_SECRET, {
        expiresIn: "100000000", // in Milliseconds (3600000 = 1 hour)
    })
}

async function doSendConfirmationEmail(email, token, protocol) {
    let port = process.env.PORT || 5000

    sendEmail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Confirm your email",
        html:
            "<h3>Please confirm your email using this </h3><a href='" +
            protocol + "://" + os.hostname() + ":" + port + "/user/confirmation/" + token +
            "'>Link</a>",
    })
}

async function sendOTP(email, codeDeReinit) {
    sendEmail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Password reset",
        html:
            "<h3>You have requested to reset your password</h3><p>Your reset code is : <b style='color : blue'>" +
            codeDeReinit +
            "</b></p>",
    })
}

function sendEmail(mailOptions) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
        },
    })

    transporter.verify(function (error, success) {
        if (error) {
            console.log(error)
            console.log("Server not ready")
        } else {
            console.log("Server is ready to take our messages")
        }
    })

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log("Email sent: " + info.response)
        }
    })
}