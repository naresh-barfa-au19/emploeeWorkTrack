const CompanyModel = require("../Models/companyModel")
const EmployeeModel = require("../Models/employeeModel")
require("dotenv").config()
const moment = require("moment")
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken")



// nodemailer sent gmail to target mails
const emailSender = async (email, message) => {
    const transporter = nodemailer.createTransport({
        host: "fullstackcoder403@gmail.com", // your email 
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
            user: 'fullstackcoder403@gmail.com', // your email 
            pass: 'noel@888' // your email id password
        }
    });

    const mailOptions = {
        from: 'fullstackcoder403@gmail.com', // your email 
        to: email,          // email of client
        subject: 'Welcome to Employee Work Track Application',
        text: message,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            return info.response
        }
    });
}

// middleware for checking jwt token
exports.authorizationMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.token;
        token = token.split(" ")
        const decoded = await jwt.verify(token[1], process.env.TOKEN_SECRET_KEY)
        req.empData = decoded;
        next()
    } catch (err) {
        res.send({
            success: false,
            data: "notToken"
        })
    }
}

// employee login with employee email, password
exports.employeeLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const fetchEmp = await EmployeeModel.findOne({ email: email });
        if (!!fetchEmp) {
            if (password == fetchEmp.password) {
                const payload = {
                    name: fetchEmp.firstName,
                    empId: fetchEmp._id,
                    email: fetchEmp.email,
                }
                const token = await jwt.sign(payload, process.env.TOKEN_SECRET_KEY);
                const message = `Hi ${payload.name}, 
                                    welcome to Employee Work Task application. Your new account has created. 
                                Thank you`
                await emailSender(payload.email, message)
                const data = "Bearer " + token
                res.status(200).send({
                    success: true,
                    data: data
                })
            } else {
                res.status(400).send({
                    success: false,
                    data: "Password incorrect."
                })
            }

        } else {
            res.status(400).send({
                success: false,
                data: "Company does not exits. Please signup."
            })
        }

    } catch (err) {
        console.log(err)
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}

// start time 
exports.startSession = async (req, res) => {
    try {
        const empData = req.empData
        res.status(200).send({
            success: true,
            data: "start time set"
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}

// end time 
exports.endSession = async (req, res) => {
    try {
        const empData = req.empData
        res.status(200).send({
            success: true,
            data: "start time set"
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}