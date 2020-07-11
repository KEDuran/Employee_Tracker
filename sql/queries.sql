-- making sure all queries below pull from employee_db
USE employee_db;

-- query to view all employee table data
SELECT 
employee.id, 
employee.first_name,
employee.last_name,
role.title,
department.name AS department,
role.salary,
CONCAT(a.first_name, " ", a.last_name) AS manager

FROM employee
LEFT JOIN role ON employee.role_id = role.id
LEFT JOIN department ON role.id = department.id
LEFT JOIN employee a ON a.id = employee.manager_id;

-- query to select all department table data
SELECT * FROM department;


-- query to select all role table data
SELECT * FROM role;

-- query for all managers
SELECT
employee.id,
CONCAT(employee.first_name, " ", employee.last_name) as manager
FROM employee
WHERE employee.manager_id IS NULL;

 -- query to get all roles with corresponding departments
 SELECT
 role.id,
 role.title
 FROM role
 
-- insert query to insert new employee