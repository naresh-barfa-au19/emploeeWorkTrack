const mongoose = require("mongoose")

const employeeSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    gender: {
        type: String,
    },
    designation: {
        type: String,
    },
    companyId: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    companyEmail: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique:true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("EmployeeModel", employeeSchema);