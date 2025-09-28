const express = require('express');
const app = express();
const path = require('path');
const Usermodel = require("./mongodb/mongo");   // User model
const Blog = require("./mongodb/mongo2");       // Blog model
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// JWT middleware to check logged-in user
app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, 'sshetuojslkdeuffvmdhfvnefjveu');
      const user = await Usermodel.findOne({ email: decoded.email });
      req.user = user;             // attach user to req
      res.locals.user = user;      // available in EJS
    } catch (err) {
      req.user = null;
      res.locals.user = null;
    }
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
});

app.set('view engine', 'ejs');

// ---------- Routes ----------

// Home
app.get("/", (req, res) => {
  res.render("index");
});

// All blogs (only if logged in)
app.get("/blogs", async (req, res) => {
  let blogs = [];
  if (req.user) {
    blogs = await Blog.find({ userId: req.user._id }).sort({ date: -1 });
  }
  res.render("Blogs", { blogs });
});

// New blog form
app.get("/blogs/new", (req, res) => {
  if (!req.user) return res.redirect("/signuppage");
  res.render("newBlog");
});

// Signup page
app.get("/signuppage", (req, res) => {
  res.render("signup");
});

// Edit blog
app.get("/blogs/:ed/edit", async (req, res) => {
  const upd = await Blog.findOne({ _id: req.params.ed });
  res.render("edit", { upd });
});

// Delete blog
app.get("/blogs/:del/delete", async (req, res) => {
  await Blog.findOneAndDelete({ _id: req.params.del });
  res.redirect("/blogs");
});

// Login submit (POST)
app.post("/login", async (req, res) => {
  const use = await Usermodel.findOne({ email: req.body.logemail });
  if (!use) {
    return res.send("User not found");
  }

  bcrypt.compare(req.body.logpassword, use.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: use.email }, 'sshetuojslkdeuffvmdhfvnefjveu');
      res.cookie("token", token);
      return res.redirect("/blogs");
    } else {
      res.send("Wrong password");
    }
  });
});

// Signup submit
app.post("/signup", (req, res) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, async (err, hash) => {
      let user = await Usermodel.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      });
      let token = jwt.sign({ email: req.body.email }, 'sshetuojslkdeuffvmdhfvnefjveu');
      res.cookie("token", token);
      res.redirect("/blogs");
    });
  });
});

// Create new blog
app.post("/blogs/create", async (req, res) => {
  if (!req.user) return res.redirect("/signuppage");

  await Blog.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: req.body.date,
    userId: req.user._id
  });

  res.redirect("/blogs");
});

// Update blog (only author field in your case)
app.post("/blogs/:update", async (req, res) => {
  await Blog.findOneAndUpdate(
    { _id: req.params.update },
    { author: req.body.author }
  );
  res.redirect("/blogs");
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// ---------- Server ----------
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
