import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Added loading state

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    // Fetch student data
    const fetchData = async () => {
      try {
        if (!studentId) {
          throw new Error("Student ID not found. Please log in again.");
        }

        // Fetch student details
        const studentResponse = await axios.get(
          `http://localhost:5002/api/student/${studentId}`
        );
        setStudentDetails(studentResponse.data);

        // Fetch courses
        const coursesResponse = await axios.get(
          `http://localhost:5002/api/student/${studentId}/courses`
        );
        setCourses(coursesResponse.data);

        // Fetch grades
        const gradesResponse = await axios.get(
          `http://localhost:5002/api/student/${studentId}/grades`
        );
        setGrades(gradesResponse.data);

        setLoading(false); // Data successfully fetched
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false); // Stop loading if there's an error
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return <div className="loading">Loading student dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="student-dashboard">
      {studentDetails && (
        <div>
          <h1>Welcome, {studentDetails.name}</h1>
          <p>Email: {studentDetails.email}</p>
        </div>
      )}

      <div className="dashboard-sections">
        {/* Enrolled Courses */}
        <div className="table-container">
          <h2>Your Enrolled Courses</h2>
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Faculty</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.name}</td>
                    <td>{course.faculty_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No courses enrolled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Grades */}
        <div className="table-container">
          <h2>Your Grades</h2>
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.length > 0 ? (
                grades.map((grade) => (
                  <tr key={grade.course_id}>
                    <td>{grade.course_name}</td>
                    <td>{grade.grade}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No grades available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Performance */}
        <div className="table-container">
          <h2>Your Performance</h2>
          <ul className="performance-list">
            {grades.length > 0 ? (
              grades.map((grade) => {
                let performance = "";
                switch (grade.grade) {
                  case "S":
                    performance = "Outstanding";
                    break;
                  case "A":
                    performance = "Excellent";
                    break;
                  case "B":
                    performance = "Good";
                    break;
                  case "C":
                    performance = "Average";
                    break;
                  default:
                    performance = "Needs Improvement";
                }

                return (
                  <li key={grade.course_id}>
                    {grade.course_name}: {performance}
                  </li>
                );
              })
            ) : (
              <li>No performance data available.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
