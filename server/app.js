require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");


const Cohort = require('./models/Cohort.model');
const Students = require('./models/Students.model');
// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// ...

const cohorts = require("./cohorts.json");
const students = require("./students.json")

// app.js

// ...

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI)
  .then(x => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch(err => console.error("Error connecting to MongoDB", err));

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();


// MIDDLEWARE
// Research Team - Set up CORS middleware here:
// ...
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173'], 
  })
);

// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

// app.get("/api/cohorts", (req, res) => {
//   res.json(cohorts);
// });

// app.get("/api/students", (req, res) => {
//   res.json(cohorts);
// });

app.get("/cohorts", (req, res) => {
  Cohort.find({})
    .then((cohorts) => {
      console.log("Retrieved cohort ->", cohorts);
      res.json(cohorts);
    })
    .catch((error) => {
      console.error("Error while getting cohorts ->", error);
      res.status(500).json({ error: "Failed to get cohorts" });
    });
});

app.get("/cohorts/:cohortId", async (req, res) => {
  try {
    const cohort = await Cohort.findById(req.params.cohortId); 
    if (!cohort) {
      return res.status(404).json({ error: 'Cohort not found' });
    }
    res.json(cohort);
  } catch (error) {
    console.error('Error getting cohort:', error); 
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid cohort ID format' });
    }
    res.status(500).json({ error: 'failed to get cohort' }); 
  }
});

app.post('/cohorts', async (req, res) => {
  try {
    const newCohort = await Cohort.create(req.body);
    res.status(201).json(newCohort);
  } catch (error) {
    console.error('Error creating cohort:', error);
    res.status(500).json({ error: 'Failed to create cohort' });
  }
});

app.put('/cohorts/:cohortId', async (req, res) => {
  try {
    const updatedCohort = await Cohort.findByIdAndUpdate(req.params.cohortId, req.body, { new: true })
    if (!updatedCohort) {
      return res.status(404).json({ error: 'Cohort not found' });
    }
    res.json(updatedCohort);
  } catch (error) {
    console.error('Error updating cohort:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid cohort ID format' });
    }
    res.status(500).json({ error: 'Failed to update cohort' });
  }
});

app.delete('/cohorts/:cohortId', async (req, res) => {
  try {
    const deletedCohort = await Cohort.findByIdAndDelete(req.params.cohortId);
    if (!deletedCohort) {
      return res.status(404).json({ error: 'Cohort not found' });
    }
    res.status(204).send(); 
  } catch (error) {
    console.error('Error deleting cohort:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid cohort ID format' });
    }
    res.status(500).json({ error: 'Failed to delete cohort' });
  }
});

app.get("/students", async (req, res) => {
  try {
    const students = await Students.find().populate('cohort')
    res.json(students);
  } catch (error) {
      console.error("Error while retrieving students ->", error);
      res.status(500).json({ error: "Failed to retrieve students" });
  }
});

app.get("/students/cohort/:cohortId", async (req, res) => {
  try {
    const students = await Students.find({ cohort: req.params.cohortId }).populate('cohort');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving students for this cohort." });
  }
});

app.get("/students/:studentId" , async (req, res) => {
  try{
    const student = await Students.findById(req.params.studentId).populate('cohort');
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving student." });
  }
});

app.post("/students", async (req, res) => {
    try {  
      const newStudent = await Students.create(req.body);
      res.status(201).json(newStudent);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ error: "Error creating student." });
    }
  });

app.delete("/students/:studentId", async (req, res) => {
  try {
    const student = await Students.findByIdAndDelete(req.params.studentId);
            
    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error deleting student." });
  }
});


// START SERVER
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});