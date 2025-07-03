const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root", 
  password: "", 
  database: "assessment_portal_3", 
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});

// Insert data into the `users` table
const insertUsers = `
  INSERT INTO users (name, email, password, role) VALUES
  ('John Doe', 'john.doe@example.com', 'password123', 'faculty'),
  ('Alice Johnson', 'alice.johnson@example.com', 'password234', 'faculty'),
  ('Robert Brown', 'robert.brown@example.com', 'password345', 'faculty'),
  ('Emily Davis', 'emily.davis@example.com', 'password456', 'faculty'),
  ('Michael Wilson', 'michael.wilson@example.com', 'password567', 'faculty'),
  ('Jane Smith', 'jane.smith@example.com', 'password123', 'student'),
  ('David Clark', 'david.clark@example.com', 'password234', 'student'),
  ('Susan Taylor', 'susan.taylor@example.com', 'password345', 'student'),
  ('Mark Lee', 'mark.lee@example.com', 'password456', 'student'),
  ('Laura Martinez', 'laura.martinez@example.com', 'password567', 'student');
`;

// Insert data into the `courses` table
const insertCourses = `
  INSERT INTO courses (name, faculty_id) VALUES
  ('Machine Learning', 1),
  ('Web Technology', 2),
  ('Software Engineering', 3),
  ('System Software', 4),
  ('Mini Project', 5),
  ('Vikas', 1),
  ('Computer Networking', 2);
`;

// Insert data into the `grades` table
const insertGrades = `
  INSERT INTO grades (student_id, course_id, grade) VALUES
  -- Grades for Jane Smith (student_id = 6)
  (6, 1, 'S'), (6, 2, 'B'), (6, 3, 'A'), (6, 4, 'C'), (6, 5, 'A'), (6, 6, 'B'), (6, 7, 'B'),
  -- Grades for David Clark (student_id = 7)
  (7, 1, 'B'), (7, 2, 'A'), (7, 3, 'B'), (7, 4, 'S'), (7, 5, 'B'), (7, 6, 'B'), (7, 7, 'A'),
  -- Grades for Susan Taylor (student_id = 8)
  (8, 1, 'S'), (8, 2, 'B'), (8, 3, 'A'), (8, 4, 'B'), (8, 5, 'A'), (8, 6, 'S'), (8, 7, 'B'),
  -- Grades for Mark Lee (student_id = 9)
  (9, 1, 'B'), (9, 2, 'A'), (9, 3, 'B'), (9, 4, 'S'), (9, 5, 'B'), (9, 6, 'B'), (9, 7, 'A'),
  -- Grades for Laura Martinez (student_id = 10)
  (10, 1, 'S'), (10, 2, 'B'), (10, 3, 'A'), (10, 4, 'B'), (10, 5, 'S'), (10, 6, 'B'), (10, 7, 'S');
`;

// Execute the queries sequentially
db.query(insertUsers, (err, result) => {
  if (err) {
    console.error("Error inserting into users table:", err);
    process.exit(1);
  }
  console.log("Users inserted successfully.");

  db.query(insertCourses, (err, result) => {
    if (err) {
      console.error("Error inserting into courses table:", err);
      process.exit(1);
    }
    console.log("Courses inserted successfully.");

    db.query(insertGrades, (err, result) => {
      if (err) {
        console.error("Error inserting into grades table:", err);
        process.exit(1);
      }
      console.log("Grades inserted successfully.");
      db.end(); // Close the connection
    });
  });
});
