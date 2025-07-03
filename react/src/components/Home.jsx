import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* <h1 className="college">WELCOME To KLE Technological University...!!</h1> */}
      <div className="home-container">
        <div className="overlay">
          <header className="header">
            <h1 className="college-name">Internal Assessment Portal</h1>
            <h2 className="department-name">School of Computer Science and Engineering</h2>
            <p className="address">Hubballi, India</p>
          </header>

          <div className="quote">
            {/* <p>
              "The KLE Technological University offers learning experiences that stimulate, challenge, and fulfill the potential of students, leading to meaningful careers and profound contributions to society."
            </p> */}
          </div>

          <div className="card-container">
            <div
              className="card"
              onClick={() => navigate("/login?role=student")}
            >
              <h3>Student Portal</h3>
            </div>
            <div
              className="card"
              onClick={() => navigate("/login?role=faculty")}
            >
              <h3>Faculty Portal</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
