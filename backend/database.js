const mysql = require("mysql2");

// Create a MySQL connection
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});

const setupQueries = [
  `CREATE DATABASE IF NOT EXISTS assessment_portal_3;`,
  `USE assessment_portal_3;`,
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    role ENUM('faculty', 'student')
  );`,
  `CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    faculty_id INT,
    FOREIGN KEY (faculty_id) REFERENCES users(id)
  );`,
  `CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    course_id INT,
    grade CHAR(2),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );`,
];

const executeQueries = async () => {
  for (const query of setupQueries) {
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error executing query:", err.message);
        process.exit(1);
      }
      console.log("Query executed successfully:", query);
    });
  }
  db.end(); // Close the connection
};

executeQueries();
