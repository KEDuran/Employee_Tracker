const inquirer = require("inquirer");

function validation() {
	if (value != "") {
		return true;
	} else {
		return "Please answer the question.";
	}
}

const intro = [
	{
		type: "list",
		name: "intro",
		message: "What would you like to do?",
		choices: [
			"View all employees",
			"View all departments",
			"View all roles",
			"Add an employee",
			"Add a new deparmenet",
			"Add a new employee role",
			"Update employee's role",
			"Update employee's manager",
			"Update employee's department",
		],
	},
];
