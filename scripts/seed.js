require("dotenv").config({
  path: ".env.local",
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const schema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    subject: String,
  });

  const User = mongoose.model("User", schema);
  await User.deleteMany();

  const pass = await bcrypt.hash("123456", 10);
  await User.insertMany([
    {
      name: "Admin",
      email: "admin@mail.com",
      password: pass,
      role: "admin",
    },

    {
      name: "Dr. Rajesh Sharma",
      email: "rajesh.sharma@mail.com",
      password: pass,
      role: "teacher",
      subject: "Object Oriented Programming and Methodology",
    },

    {
      name: "Prof. Krisha Kansara",
      email: "krisha.kansara@mail.com",
      password: pass,
      role: "teacher",
      subject: "Database Management System",
    },

    {
      name: "Dr. Amit Verma",
      email: "amit.verma@mail.com",
      password: pass,
      role: "teacher",
      subject: "Data Structures and Algorithms",
    },

    {
      name: "Prof. Prachi Champaneria",
      email: "prachi.champaneria@mail.com",
      password: pass,
      role: "teacher",
      subject: "Computer Networks",
    },

    {
      name: "Dr. Vivek Surati",
      email: "vivek.surati@mail.com",
      password: pass,
      role: "teacher",
      subject: "Operating Systems",
    },

    {
      name: "Dr. Kunal Joshi",
      email: "kunal.joshi@mail.com",
      password: pass,
      role: "teacher",
      subject: "Web Technology",
    },

    {
      name: "Dr. Arvind Nair",
      email: "arvind.nair@mail.com",
      password: pass,
      role: "teacher",
      subject: "Artificial Intelligence",
    },
  ]);

  console.log("seed done");
  process.exit();
}

run();
