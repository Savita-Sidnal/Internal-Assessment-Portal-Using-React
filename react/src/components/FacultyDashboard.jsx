import React, { useState } from "react";
import axios from "axios";
import "./FacultyDashboard.css";


const FacultyDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    facultyId: "",
    email: "",
    password: "",
    facultyName: "",
  });
  const [isFacultyValid, setIsFacultyValid] = useState(true);
  const [isFacultyDetailsVisible, setIsFacultyDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Delete Course State
  const [deleteCourseData, setDeleteCourseData] = useState({
    courseName: "",
    facultyId: "",
  });

  // Update Grade State
  const [updateGradeData, setUpdateGradeData] = useState({
    studentId: "",
    courseId: "",
    grade: "",
  });

  // Add Course Function
  const handleAddCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!newCourse.name || !newCourse.facultyId) {
        alert("Course Name and Faculty ID are required.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5002/api/validateFaculty",
        { facultyId: newCourse.facultyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.exists) {
        const addCourseResponse = await axios.post(
          "http://localhost:5002/api/addCourse",
          { name: newCourse.name, facultyId: newCourse.facultyId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert(addCourseResponse.data.message);
        fetchCourses();
        resetForm();
      } else {
        setIsFacultyValid(false);
        setIsFacultyDetailsVisible(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  // Save Faculty and Course Function
  const handleSaveFacultyAndCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5002/api/addCourse",
        newCourse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      fetchCourses();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  // Delete Course Function
  const handleDeleteCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!deleteCourseData.courseName || !deleteCourseData.facultyId) {
        alert("Course Name and Faculty ID are required.");
        return;
      }

      const response = await axios.delete(
        "http://localhost:5002/api/deleteCourse",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: deleteCourseData,
        }
      );

      alert(response.data.message);
      fetchCourses();
      resetDeleteForm();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete course");
    } finally {
      setLoading(false);
    }
  };

  // Update Grade Function
  const handleUpdateGrade = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!updateGradeData.studentId || !updateGradeData.courseId || updateGradeData.grade === "") {
        alert("Student ID, Course ID, and Grade are required.");
        return;
      }

      const response = await axios.put(
        "http://localhost:5002/api/updateGrade",
        updateGradeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      resetUpdateGradeForm();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update grade");
    } finally {
      setLoading(false);
    }
  };

  // Reset Forms
  const resetDeleteForm = () => setDeleteCourseData({ courseName: "", facultyId: "" });
  const resetUpdateGradeForm = () => setUpdateGradeData({ studentId: "", courseId: "", grade: "" });
  const resetForm = () =>
    setNewCourse({ name: "", facultyId: "", email: "", password: "", facultyName: "" });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Faculty Dashboard</h1>

      {/* Add New Course Section */}
      <h2>Add New Course</h2>
      <input
        type="text"
        placeholder="Course Name"
        value={newCourse.name}
        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Faculty ID"
        value={newCourse.facultyId}
        onChange={(e) => setNewCourse({ ...newCourse, facultyId: e.target.value })}
      />
      {isFacultyDetailsVisible && !isFacultyValid && (
        <>
          <input
            type="text"
            placeholder="Faculty Name"
            value={newCourse.facultyName}
            onChange={(e) => setNewCourse({ ...newCourse, facultyName: e.target.value })}
          />
          <input
            type="email"
            placeholder="Faculty Email"
            value={newCourse.email}
            onChange={(e) => setNewCourse({ ...newCourse, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Faculty Password"
            value={newCourse.password}
            onChange={(e) => setNewCourse({ ...newCourse, password: e.target.value })}
          />
        </>
      )}
      {!isFacultyDetailsVisible && (
        <button onClick={handleAddCourse} disabled={loading}>
          {loading ? "Adding..." : "Add Course"}
        </button>
      )}
      {isFacultyDetailsVisible && !isFacultyValid && (
        <button onClick={handleSaveFacultyAndCourse} disabled={loading}>
          {loading ? "Saving..." : "Save Faculty and Add Course"}
        </button>
      )}

      {/* Delete Course Section */}
      <h2>Delete Course</h2>
      <input
        type="text"
        placeholder="Course Name"
        value={deleteCourseData.courseName}
        onChange={(e) => setDeleteCourseData({ ...deleteCourseData, courseName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Faculty ID"
        value={deleteCourseData.facultyId}
        onChange={(e) => setDeleteCourseData({ ...deleteCourseData, facultyId: e.target.value })}
      />
      <button onClick={handleDeleteCourse} disabled={loading}>
        {loading ? "Deleting..." : "Delete Course"}
      </button>

      {/* Update Grade Section */}
      <h2>Update Grade</h2>
      <input
        type="text"
        placeholder="Student ID"
        value={updateGradeData.studentId}
        onChange={(e) => setUpdateGradeData({ ...updateGradeData, studentId: e.target.value })}
      />
      <input
        type="text"
        placeholder="Course ID"
        value={updateGradeData.courseId}
        onChange={(e) => setUpdateGradeData({ ...updateGradeData, courseId: e.target.value })}
      />
      <input
        type="text"
        placeholder="Grade"
        value={updateGradeData.grade}
        onChange={(e) => setUpdateGradeData({ ...updateGradeData, grade: e.target.value })}
      />
      <button onClick={handleUpdateGrade} disabled={loading}>
        {loading ? "Updating..." : "Update Grade"}
      </button>
    </div>
  );
};

export default FacultyDashboard;
