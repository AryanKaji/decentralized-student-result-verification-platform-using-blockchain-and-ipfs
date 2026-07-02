require("dotenv").config({
  path: ".env.local",
});

const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const schema = new mongoose.Schema({
    studentId: String,
    name: String,
    class: String,
    roll: Number,
  });

  const Student = mongoose.model("Student", schema);

  await Student.deleteMany();

  await Student.insertMany([
    {
      studentId: "ST001",
      name: "Aarav Patel",
      class: "10A",
      roll: 1,
    },

    {
      studentId: "ST002",
      name: "Riya Jariwala",
      class: "10A",
      roll: 2,
    },

    {
      studentId: "ST003",
      name: "Kabir Mehta",
      class: "10A",
      roll: 3,
    },

    {
      studentId: "ST004",
      name: "Harishree Kapadia",
      class: "10A",
      roll: 4,
    },

    {
      studentId: "ST005",
      name: "Pratham Desai",
      class: "10A",
      roll: 5,
    },
  ]);

  console.log("students seeded");

  process.exit();
}

run();
