const express = require("express")
const app = express()
require("dotenv").config()
require("./Config/db")
const companyRoutes = require("./Routers/company")
const employeeRoutes = require("./Routers/employee")

app.use(express.json())
app.use("/company",companyRoutes)
app.use("./employee",employeeRoutes)

app.listen(process.env.PORT || 7000,()=>{
    console.log(`server is running on port : ${process.env.PORT} `)
})