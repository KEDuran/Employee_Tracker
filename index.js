const inquirer = require("inquirer");
const cTable = require("console.table");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
// establish server connection configuration
var connection = mysql.createConnection({
	host: "localhost",

	// my local MySQL default port
	port: 3306,

	// username
	user: "root",

	// password
	password: "server_password",
	database: "employee_db",
});
// creating the connection to the employee_db database
connection.connect(function (err) {
	if (err) throw err;
});

// Function to validaate that each questions is entered.
function validation(value) {
	if (value != "") {
		return true;
	} else {
		return "Please answer the question.";
	}
}
// Intro question to kick-off the application flow
const introQuestion = [
	{
		type: "list",
		name: "intro",
		message: "What would you like to do?",
		choices: [
			"View all employees",
			"View all departments",
			"View all roles",
			"Add an employee",
			"Add a department",
			"Add an employee role",
			"Update employee role",
			"Exit application",
		],
		validate: validation,
	},
];

// Question to trigger the add new employee flow
const addEmployeeQuestion = [
	{
		type: "input",
		name: "firstName",
		message: "Please enter employee's first name.",
		validate: validation,
	},
	{
		type: "input",
		name: "lastName",
		message: "Please enter employee's last name.",
		validate: validation,
	},
	{
		type: "list",
		name: "employeeRole",
		message: "Please select the employee's role.",
		choices: async function () {
			var employeeRole = [];
			var promiseWrapper = function () {
				return new Promise((resolve) => {
					connection.query(`SELECT role.title FROM role`, function (
						err,
						res,
						field
					) {
						if (err) throw err;
						for (var i = 0; i < res.length; i++) {
							employeeRole.push(`${res[i].title}`);
						}
						resolve("resolved");
					});
				});
			};
			await promiseWrapper();
			return employeeRole;
		},
	},
	{
		type: "list",
		name: "employeeManager",
		message: "Please select the employee's manager.",
		choices: async function () {
			var employeeManager = [];
			var promiseWrapper = function () {
				return new Promise((resolve) => {
					connection.query(
						`SELECT
						employee.id,
						CONCAT(employee.first_name, " ", employee.last_name) as manager
						FROM employee
						WHERE employee.manager_id IS NULL;`,
						function (err, res, field) {
							if (err) throw err;
							for (var i = 0; i < res.length; i++) {
								employeeManager.push(`${res[i].manager}`);
							}
							resolve("resolved");
						}
					);
				});
			};
			await promiseWrapper();
			return employeeManager;
		},
	},
];

// Question to trigger add new role flow
const addRoleQuestion = [
	{
		type: "input",
		name: "newRole",
		message: "Please enter the title of the new role.",
		validate: validation,
	},
];

// Question to trigger add new department flow
const addDepartmentQuestion = [
	{
		type: "input",
		name: "newDepartment",
		message: "Please enter the name of the new department.",
		validate: validation,
	},
];

// Question to trigger update employee flow
const updateEmployeeRoleQuestion = [
	{
		type: "list",
		name: "updateRole",
		message: "Which employee would you like to update?",
		choices: function () {
			var employeeChoices = [];
			for (var i = 0; i < results.length; i++) {
				employeeChoices.push(
					`${results[i].first_name} ${results[i].last_name}`
				);
			}
			return employeeChoices;
		},
	},
];

// Function to view all employees
function viewAllEmployees() {
	connection.query(
		`SELECT employee.id, employee.first_name, employee.last_name, role.title,
		department.name AS department,role.salary,CONCAT(a.first_name, " ", a.last_name) AS manager
		FROM employee
		LEFT JOIN role ON employee.role_id = role.id
		LEFT JOIN department ON role.id = department.id
		LEFT JOIN employee a ON a.id = employee.manager_id;`,
		function (err, res, field) {
			if (err) throw err;
			console.table(res);
			inquirer.prompt(introQuestion).then(answerChoices);
		}
	);
}

// Function to view all departments
function viewAllDepartments() {
	connection.query("SELECT * FROM department;", function (err, res, field) {
		if (err) throw err;
		console.table(res);
		inquirer.prompt(introQuestion).then(answerChoices);
	});
}

// Function to view all roles
function viewAllRoles() {
	connection.query("SELECT * FROM role;", function (err, res, field) {
		if (err) throw err;
		console.table(res);
		inquirer.prompt(introQuestion).then(answerChoices);
	});
}

// Function to add a new employee
function addNewEmployee() {
	inquirer.prompt(addEmployeeQuestion).then(async function (answers) {
		var fName = answers.firstName;
		var lName = answers.lastName;
		var selectedRole = answers.employeeRole;
		var selectedManager = answers.employeeManager;
		// Extracting the role id for a given role title using async await
		var promiseWrapper1 = function () {
			return new Promise((resolve) => {
				connection.query(
					`SELECT role.id FROM role WHERE role.title = '${selectedRole}';`,
					function (err, res, field) {
						if (err) throw err;
						resolve(res[0].id);
					}
				);
			});
		};
		// roleId variable that will be applies when adding an employee
		var roleId = await promiseWrapper1();

		// Extracting the manager id for a given manager
		var promiseWrapper2 = function () {
			return new Promise((resolve) => {
				connection.query(
					`SELECT employee.id FROM employee
					WHERE CONCAT(employee.first_name, " ", employee.last_name) = '${selectedManager}';`,
					function (err, res, field) {
						if (err) throw err;
						resolve(res[0].id);
					}
				);
			});
		};
		// mangerId variable that will be applies when adding an employee
		var managerId = await promiseWrapper2();

		// inserting new employee input into employee table
		connection.query(
			`INSERT INTO employee (first_name, last_name, role_id, manager_id) 
			VALUES('${fName}', '${lName}', ${roleId}, ${managerId});`,
			function (err, res, field) {
				if (err) throw err;
				inquirer.prompt(introQuestion).then(answerChoices);
			}
		);
	});
}

// Function to add a new department
function addNewDepartment() {
	inquirer.prompt(addDepartmentQuestion).then(async function (answers) {
		// inserting new department input into department table
		connection.query(
			`INSERT INTO department (name) VALUES('${answers.newDepartment}');`,
			function (err, res, field) {
				if (err) throw err;
				inquirer.prompt(introQuestion).then(answerChoices);
			}
		);
	});
}

// Function to add a new employee role
function addNewEmployeeRole() {}

// function to store logic for answer choices
function answerChoices(answer) {
	if (answer.intro === "View all employees") {
		viewAllEmployees();
	} else if (answer.intro === "View all departments") {
		viewAllDepartments();
	} else if (answer.intro === "View all roles") {
		viewAllRoles();
	} else if (answer.intro === "Add an employee") {
		addNewEmployee();
	} else if (answer.intro === "Add a department") {
		addNewDepartment();
	} else if (answer.intro === "Exit application") {
		connection.end();
		return;
	}
}

// start inquirer prompt for employee questions
inquirer.prompt(introQuestion).then(answerChoices);
