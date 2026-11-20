const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let students = [];
let nextId = 1;

app.post('/api/students', (req, res) => {
  const { name, course, age } = req.body;

  
  if (!name || !course || age === undefined || typeof age !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid required fields: name (text), course (text), age (number)' });
  }

  const duplicate = students.find(
    (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ error: 'Student with this name already exists' });
  }

  const newStudent = {
    id: nextId++,
    name: name.trim(),
    course: course.trim(),
    age
  };

  students.push(newStudent);

  // Rule: New added -> 201
  res.status(201).json(newStudent);
});

// 2. GET /api/students - Get all students (with optional ?course= filter)
app.get('/api/students', (req, res) => {
  const { course } = req.query;

  if (course) {
    const filtered = students.filter(
      (s) => s.course.toLowerCase() === course.trim().toLowerCase()
    );
    return res.status(200).json(filtered);
  }

  res.status(200).json(students);
});

// 3. GET /api/students/:id - Get a single student by ID
app.get('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const student = students.find((s) => s.id === id);

  // Rule: Wrong id -> 404
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.status(200).json(student);
});

// 4. PUT /api/students/:id - Update an existing student
app.put('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const student = students.find((s) => s.id === id);

  // Rule: Wrong id -> 404
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const { name, course, age } = req.body;

  // Rule: Missing data -> 400
  if (!name || !course || age === undefined || typeof age !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid required fields: name (text), course (text), age (number)' });
  }

  // Rule: Same name twice -> 409 (exclude current student from duplicate check)
  const duplicate = students.find(
    (s) => s.id !== id && s.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ error: 'Another student with this name already exists' });
  }

  student.name = name.trim();
  student.course = course.trim();
  student.age = age;

  res.status(200).json(student);
});

// 5. DELETE /api/students/:id - Delete a student
app.delete('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = students.findIndex((s) => s.id === id);

  // Rule: Wrong id -> 404
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const deletedStudent = students.splice(index, 1)[0];
  res.status(200).json({ message: 'Student deleted', student: deletedStudent });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});