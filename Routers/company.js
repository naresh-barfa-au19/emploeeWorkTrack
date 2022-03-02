const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator");
const multer = require("../Config/multer")
const { authorizationMiddleware,
    companySignUp,
    companyLogin,
    csvUploader } = require("../Controllers/company")

// validation middleware for login and sign up
validationMiddleware = async (req, res, next) => {
    const error = validationResult(req).formatWith((msg) => msg);
    const hasError = error.isEmpty();
    if (hasError) {
        next();
    } else {
        res.status(400).send(error);
    }
};
// signup route 
router.post("/signup",
    [
        check("name")
            .trim()
            .not()
            .isEmpty()
            .withMessage("Please enter Company Name."),

        check("email")
            .trim()
            .not()
            .isEmpty()
            .withMessage("Please Enter Company Email")
            .isEmail()
            .withMessage("Email is not correct"),

        check("password")
            .trim()
            .not()
            .isEmpty()
            .withMessage("Please Enter Company Password")
            .isLength({ min: 4 })
            .withMessage("Password should be minimum 4 character long."),

        check("confirmPassword")
            .not()
            .isEmpty()
            .withMessage("Please Enter Confirm password.")
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Password does not match.");
                } else {
                    return true;
                }
            }),

    ], validationMiddleware, companySignUp);

// login route
router.post("/login",
    [
        check("email")
            .not()
            .isEmpty()
            .withMessage("Please enter Email.")
            .trim()
            .isEmail()
            .withMessage("Email is not correct."),

        check("password")
            .not()
            .isEmpty()
            .withMessage("Please Enter password.")

    ],
    validationMiddleware, companyLogin);

// csv file uploader route 
router.post("/csv", authorizationMiddleware, multer.single("csvFile"), csvUploader)

module.exports = router