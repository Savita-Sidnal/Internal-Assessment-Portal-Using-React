const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "assessment_portal_3",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});

// JWT Secret
const JWT_SECRET = "your-secret-key";

// Middleware for validating JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Login API
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length > 0) {
      const user = results[0];
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({ token, role: user.role, id: user.id });
    }
    res.status(401).json({ message: "Invalid email or password" });
  });
});

//Student
// API to fetch student details
app.get("/api/student/:id", (req, res) => {
  const studentId = req.params.id;
  const query = "SELECT * FROM users WHERE id = ? AND role = 'student'";
  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// API to fetch courses a student is enrolled in
app.get("/api/student/:id/courses", (req, res) => {
  const studentId = req.params.id;
  const query = `
    SELECT c.id, c.name, f.name AS faculty_name
    FROM courses c
    JOIN grades g ON c.id = g.course_id
    JOIN users f ON c.faculty_id = f.id
    WHERE g.student_id = ?
  `;
  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// API to fetch grades for a student's courses
app.get("/api/student/:id/grades", (req, res) => {
  const studentId = req.params.id;
  const query = `
    SELECT c.name AS course_name, g.grade, c.id AS course_id
    FROM grades g
    JOIN courses c ON g.course_id = c.id
    WHERE g.student_id = ?
  `;
  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// API to fetch faculty courses
app.get("/api/faculty/courses", (req, res) => {
  const facultyId = req.user.id;
  const query = "SELECT * FROM courses WHERE faculty_id = ?";
  db.query(query, [facultyId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// API to fetch students in a course
app.get("/api/faculty/courses/:courseId/students", (req, res) => {
  const courseId = req.params.courseId;
  const query = `
    SELECT u.id, u.name FROM users u
    JOIN grades g ON u.id = g.student_id
    WHERE g.course_id = ? AND u.role = 'student'
  `;
  db.query(query, [courseId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
//


// Add New Course API
app.post("/api/validateFaculty", authenticateToken, (req, res) => {
  const { facultyId } = req.body;

  if (!facultyId) {
    return res.status(400).json({ message: "Faculty ID is required." });
  }

  const query = "SELECT * FROM users WHERE id = ? AND role = 'faculty'";
  db.query(query, [facultyId], (err, results) => {
    if (err) {
      return res.status(500).send("Error validating faculty: " + err.message);
    }

    if (results.length > 0) {
      return res.status(200).json({ exists: true });
    }

    return res.status(200).json({ exists: false });
  });
});

app.post("/api/addCourse", authenticateToken, (req, res) => {
  const { name, facultyId, email, password, facultyName } = req.body;

  if (!name || !facultyId) {
    return res.status(400).send("Missing required fields: name or facultyId.");
  }

  // Check if the faculty exists in the users table
  const checkFacultyQuery = "SELECT * FROM users WHERE id = ? AND role = 'faculty'";
  db.query(checkFacultyQuery, [facultyId], (err, results) => {
    if (err) {
      return res.status(500).send("Error checking faculty: " + err.message);
    }

    if (results.length === 0) {
      // If faculty does not exist, add the faculty to the users table
      const addFacultyQuery = `INSERT INTO users (id, name, email, password, role) 
        VALUES (?, ?, ?, ?, 'faculty')`;
      db.query(addFacultyQuery, [facultyId, facultyName, email, password], (err) => {
        if (err) {
          return res.status(500).send("Failed to add faculty: " + err.message);
        }

        // Now insert the new course
        const addCourseQuery = "INSERT INTO courses (name, faculty_id) VALUES (?, ?)";
        db.query(addCourseQuery, [name, facultyId], (err, result) => {
          if (err) {
            return res.status(500).send("Error adding course: " + err.message);
          }

          res.status(201).json({ id: result.insertId, message: "Faculty and course added successfully." });
        });
      });
    } else {
      // Faculty exists, just add the course
      const addCourseQuery = "INSERT INTO courses (name, faculty_id) VALUES (?, ?)";
      db.query(addCourseQuery, [name, facultyId], (err, result) => {
        if (err) {
          return res.status(500).send("Error adding course: " + err.message);
        }

        res.status(201).json({ id: result.insertId, message: "Course added successfully." });
      });
    }
  });
});

//DELETE
app.delete("/api/deleteCourse", authenticateToken, (req, res) => {
  const { courseName, facultyId } = req.body;

  if (!courseName || !facultyId) {
    return res.status(400).json({ message: "Course Name and Faculty ID are required." });
  }

  // Start a transaction to ensure all related data is deleted atomically
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: "Error starting transaction." });
    }

    // Step 1: Get the course ID from the courses table
    const getCourseIdQuery = "SELECT id FROM courses WHERE name = ? AND faculty_id = ?";
    db.query(getCourseIdQuery, [courseName, facultyId], (err, results) => {
      if (err) {
        return db.rollback(() => {
          return res.status(500).json({ message: "Error fetching course ID." });
        });
      }

      if (results.length === 0) {
        return db.rollback(() => {
          return res.status(404).json({ message: "Course not found." });
        });
      }

      const courseId = results[0].id;

      // Step 2: Delete related records from the grades table using the fetched course ID
      const deleteGradesQuery = "DELETE FROM grades WHERE course_id = ?";
      db.query(deleteGradesQuery, [courseId], (err) => {
        if (err) {
          return db.rollback(() => {
            return res.status(500).json({ message: "Error deleting grades for course." });
          });
        }

        // Step 3: Delete the course from the courses table
        const deleteCourseQuery = "DELETE FROM courses WHERE id = ?";
        db.query(deleteCourseQuery, [courseId], (err) => {
          if (err) {
            return db.rollback(() => {
              return res.status(500).json({ message: "Error deleting course from courses table." });
            });
          }

          // Step 4: Check if the faculty is associated with other courses
          const checkFacultyCoursesQuery = "SELECT COUNT(*) AS courseCount FROM courses WHERE faculty_id = ?";
          db.query(checkFacultyCoursesQuery, [facultyId], (err, results) => {
            if (err) {
              return db.rollback(() => {
                return res.status(500).json({ message: "Error checking faculty's other courses." });
              });
            }

            // Step 5: If the faculty has no other courses, delete them from the users table
            if (results[0].courseCount === 0) {
              const deleteFacultyQuery = "DELETE FROM users WHERE id = ? AND role = 'faculty'";
              db.query(deleteFacultyQuery, [facultyId], (err) => {
                if (err) {
                  return db.rollback(() => {
                    return res.status(500).json({ message: "Error deleting faculty from users table." });
                  });
                }

                // Commit transaction if all queries succeed
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      return res.status(500).json({ message: "Transaction commit failed." });
                    });
                  }
                  return res.status(200).json({ message: "Course, grades, and faculty (if no other courses) deleted successfully." });
                });
              });
            } else {
              // Commit transaction if faculty is still associated with other courses
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    return res.status(500).json({ message: "Transaction commit failed." });
                  });
                }
                return res.status(200).json({ message: "Course and grades deleted successfully, faculty not removed." });
              });
            }
          });
        });
      });
    });
  });
});

//update
// Update Grade API
app.put("/api/updateGrade", authenticateToken, (req, res) => {
  const { studentId, courseId, grade } = req.body;

  if (!studentId || !courseId || grade == null) {
    return res.status(400).json({ message: "Student ID, Course ID, and Grade are required." });
  }

  const query = "UPDATE grades SET grade = ? WHERE student_id = ? AND course_id = ?";
  db.query(query, [grade, studentId, courseId], (err, result) => {
    if (err) {
      return res.status(500).send("Error updating grade: " + err.message);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update." });
    }

    res.status(200).json({ message: "Grade updated successfully." });
  });
});





// Server setup
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
