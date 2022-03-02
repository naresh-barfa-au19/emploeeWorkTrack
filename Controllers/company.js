const CompanyModel = require("../Models/companyModel")
const EmployeeModel = require("../Models/employeeModel")
require("dotenv").config()
const bcrypt = require("bcrypt");
const moment = require("moment")
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken")
const csv = require("csv-parser");
const fs = require("fs");


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
        req.companyData = decoded;
        next()
    } catch (err) {
        res.send({
            success: false,
            data: "notToken"
        })
    }
}
// company signup with name, email, password, confirmPassword
exports.companySignUp = async (req, res) => {
    const { name, email, password } = req.body
    try {
        const fetchCompany = await CompanyModel.findOne({ email: email });
        if (!fetchCompany) {
            const hashPassword = await bcrypt.hash(password, 10)
            const companyData = {
                name: name,
                email: email,
                password: hashPassword,
                createdAt: moment()
            }
            console.log(companyData)
            await CompanyModel.insertMany([companyData]);
            res.status(200).send({
                success: true,
                data: "Company signup done successfully."
            })
        } else {
            res.status(400).send({
                success: false,
                data: "email already exits, Please login."
            })
        }
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "something went wrong server side :( "
        })
    }
}

// company login with company email, password
exports.companyLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const fetchCompany = await CompanyModel.findOne({ email: email });
        if (!!fetchCompany) {
            const matchPassword = await bcrypt.compare(password, fetchCompany.password);
            if (!!matchPassword) {
                const payload = {
                    name: fetchCompany.name,
                    companyId: fetchCompany._id,
                    email: fetchCompany.email,
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

// company csv uploader --> company can upload csv file of employee data
exports.csvUploader = async (req, res) => {
    let results = [];
    const companyData = req.companyData
    try {
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (data) => {
                results.push(data);
            })
            .on("end", async () => {
                results = results.map(obj => {
                    obj["companyId"] = companyData.companyId
                    obj["companyName"] = companyData.name
                    obj["companyEmail"] = companyData.email
                    return obj
                })
                function mapAsync(array, callbackfn) {
                    return Promise.all(array.map(callbackfn));
                }
                function filterAsync(array, callbackfn) {
                    return mapAsync(array, callbackfn).then(filterMap => {
                        return array.filter((value, index) => filterMap[index]);
                    });
                }
                function isThreeAsync(obj) {
                    return new Promise(async (res, rej) => {
                        const data = await EmployeeModel.findOne({ email: obj.email })
                        if (!data) {
                            res(true)
                        } else {
                            res(false)
                        }
                    });
                }
                filterAsync(results, isThreeAsync).then(async (result) => {
                    await EmployeeModel.insertMany(result)
                });
            });

        res.status(200).send({
            success: true,
            data: "employee added to database and sent them inivitaion"
        })
    } catch (err) {
        console.log(err)
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}