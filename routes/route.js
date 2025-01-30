const { Router } = require("express")
const multer = require("multer")
const path = require('path');
const { rollback } = require("../db/dbConnection");
const router = Router()

const { adminLogin, getUsers, CreateUsers, UpdateUsers, UserReset, DeleteUser, UserStatus, DeleteAllUsers } = require("../controller/admin/adminLogin")
const { GetAllAttendance, CreateAttendance, CreateAllAttendance, UpdateAttendance, DeleteAttendance, updateWeekDay } = require("../controller/attendance")
const { GetAllEmployee, CreateEmployee, UpdateEmployee, DeleteEmployee, EmployeeStatus, GetContractByEmployeeId, ActiveEmployee } = require("../controller/employee")
const { GetAllSalary, GetAllSalaryByMonth, AddSalary, GetMultipleSalary, UpdateSalary, EmpAttendanceByMonth, GetSalaryById, DeleteSalary, GetEmployeeWorking, UploadPdf, AddAllEmployeeSalary } = require("../controller/salary")
const { GetAllVacations, AddVacation, UpdateVacation, GetVacationById, DeleteVacation } = require("../controller/vacation")
const { GetAllAdvancePayments, AddAdvancePayment, UpdateAdvancePayment, GetAdvancePaymentById, DeleteAdvancePayment } = require("../controller/advancePayments")
const { GetAllbonusAndDeduction, AddbonusDeduction, UpdatebonusDeduction, GetbonusDeductionById, DeletebonusDeduction } = require("../controller/bonusDeduction")
const { GetAllcontract, Addcontract, Updatecontract, GetcontractById, Deletecontract, AddSSORate, AddWHTRate, AddtDailyRate, AddOverTime, getLatestSSORate } = require("../controller/contract")
const { GetProvinces, GetDistrict, GetSubDistrict, GetEmployee, GetPayDetailsDrop, GetLeaves, GetTransactionType, GetBonusTransactionsType, GetWorkerType } = require("../controller/AllDropDown")
const { GetMenu, AddMenu, UpdateMenu, DeleteMenu, ChangeMenuStatus } = require('../controller/menu')

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/image")
	},
	filename: (req, file, cb) => {
		cb(null, new Date().getTime() + path.extname(file.originalname))
	},
})
const imageFilter = (req, file, cb) => {
	if (
		file.mimetype == "image/png" ||
		file.mimetype == "image/jpg" ||
		file.mimetype == "image/jpeg" ||
		file.mimetype == "application/pdf"
	) {
		cb(null, true)
	} else {
		cb(null, false)
		return cb(new Error("Only .png, .jpg, .jpeg, .pdf formats are allowed!"))
	}
}

const upload = multer({
	storage: storage,
	fileFilter: imageFilter,
	limits: { fileSize: 1024 * 1024 * 10 },
})

const Newstorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './public/image');
	},
	filename: (req, file, cb) => {
		// Use the original file name
		cb(null, file.originalname);
	},
});

const uploads = multer({ storage: Newstorage });

//adminLogin.js
router.post("/adminLogin", adminLogin)
router.get("/getUsers", getUsers)
router.post("/CreateUsers", CreateUsers)
router.post("/UpdateUsers", UpdateUsers)
router.post("/UserReset", UserReset)
router.post("/DeleteUser", DeleteUser)
router.post("/UserStatus", UserStatus)
router.post("/DeleteAllUsers", DeleteAllUsers)

// attendance.js
router.get("/GetAllAttendance", GetAllAttendance)
router.post("/CreateAttendance", CreateAttendance)
router.post("/CreateAllAttendance", CreateAllAttendance)
router.post("/UpdateAttendance", UpdateAttendance)
router.post("/DeleteAttendance", DeleteAttendance)
router.post("/updateWeekDay", updateWeekDay)

// employee.js
router.get("/GetAllEmployee", GetAllEmployee)
router.post("/CreateEmployee", uploads.single('profile'), CreateEmployee)
router.post("/UpdateEmployee", uploads.single('profile'), UpdateEmployee)
router.post("/DeleteEmployee", DeleteEmployee)
router.post("/EmployeeStatus", EmployeeStatus)
router.post("/GetContractByEmplId", GetContractByEmployeeId)
router.get("/ActiveEmployee", ActiveEmployee)

// salary,js
router.get("/GetAllSalary", GetAllSalary)
router.post("/GetAllSalaryByMonth", GetAllSalaryByMonth)
router.post("/AddSalary", AddSalary)
router.post("/GetMultipleSalary", GetMultipleSalary)
router.post("/UpdateSalary", UpdateSalary)
router.post("/EmpAttendanceByMonth", EmpAttendanceByMonth)
router.post("/GetSalaryById", GetSalaryById)
router.post("/DeleteSalary", DeleteSalary)
router.post("/GetEmployeeWorking", GetEmployeeWorking)
router.post("/UploadPdf", uploads.single('document'), UploadPdf)
router.post("/AddAllEmployeeSalary", AddAllEmployeeSalary)

//vacation.js
router.get("/GetAllVacations", GetAllVacations)
router.post("/AddVacation", AddVacation)
router.post("/UpdateVacation", UpdateVacation)
router.post("/GetVacationById", GetVacationById)
router.post("/DeleteVacation", DeleteVacation)

//advancePayments.js
router.get("/GetAllAdvancePayments", GetAllAdvancePayments)
router.post("/AddAdvancePayment", AddAdvancePayment)
router.post("/UpdateAdvancePayment", UpdateAdvancePayment)
router.post("/GetAdvancePaymentById", GetAdvancePaymentById)
router.post("/DeleteAdvancePayment", DeleteAdvancePayment)

//bonusDeduction.js
router.get("/GetAllbonusAndDeduction", GetAllbonusAndDeduction)
router.post("/AddbonusDeduction", AddbonusDeduction)
router.post("/UpdatebonusDeduction", UpdatebonusDeduction)
router.post("/GetbonusDeductionById", GetbonusDeductionById)
router.post("/DeletebonusDeduction", DeletebonusDeduction)

//contract.js
router.get("/GetAllcontract", GetAllcontract)
router.post("/Addcontract", Addcontract)
router.post("/Updatecontract", Updatecontract)
router.post("/GetcontractById", GetcontractById)
router.post("/Deletecontract", Deletecontract)
router.post("/AddSSORate", AddSSORate)
router.post("/AddWHTRate", AddWHTRate)
router.post("/AddtDailyRate", AddtDailyRate)
router.post("/AddOverTime", AddOverTime)
router.get("/getLatestSSORate", getLatestSSORate)

//AllDropDown.js
router.get("/GetProvinces", GetProvinces)
router.get("/GetDistrict", GetDistrict)
router.get("/GetSubDistrict", GetSubDistrict)
router.get("/GetEmployee", GetEmployee)
router.get("/GetPayDetailsDrop", GetPayDetailsDrop)
router.get("/GetLeaves", GetLeaves)
router.get("/GetTransactionType", GetTransactionType)
router.get("/GetBonusTransactionsType", GetBonusTransactionsType)
router.get("/GetWorkerType", GetWorkerType)

// menu.js
router.get("/GetMenu", GetMenu)
router.post("/AddMenu", AddMenu)
router.post("/UpdateMenu", UpdateMenu)
router.post("/DeleteMenu", DeleteMenu)
router.post("/ChangeMenuStatus", ChangeMenuStatus)

module.exports = router
