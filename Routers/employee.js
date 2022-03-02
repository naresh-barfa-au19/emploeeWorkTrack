const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator");
const { authorizationMiddleware,
    employeeLogin,
    startSession,
    endSession } = require("../Controllers/employee")

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
    validationMiddleware, employeeLogin);

// employee start time 
router.post("/startSession", authorizationMiddleware, startSession)

// employee end time 
router.post("/endSession", authorizationMiddleware, endSession)

module.exports = router