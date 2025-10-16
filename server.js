const express = require('express');
const app = express();
const path = require('path');
const Usermodel = require("./models/mongo");   // User model
const Blog = require("./models/mongo2");       // Blog model
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
require("./config/passport"); // your Google OAuth strategy file

// ---------- Middleware Setup ----------
app.use(session({
  secret: "mysecret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// ---------- JWT + OAuth Combined Middleware ----------
app.use(async (req, res, next) => {
  // 1️⃣ JWT-based user check
  res.locals.user = null;
  try{
    const token = req.cookies.token;
    if (token) {
          const decoded = jwt.verify(token, 'sshetuojslkdeuffvmdhfvnefjveu');
          const user = await Usermodel.findOne({ email: decoded.email });
          req.user = user;
          res.locals.user = user;
          if (user) {
            req.user = user;
            res.locals.user = user;
            return next();
          }
      }
      if (req.isAuthenticated && req.isAuthenticated()) {
        req.user = req.user || req.session.passport?.user;
        res.locals.user = req.user;
      }
  }catch(err){
      req.user = null;
      res.locals.user = null;
  }

  // 2️⃣ OAuth-based user check

  next();
});

app.set('view engine', 'ejs');

// ---------- GOOGLE OAUTH ROUTES ----------
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signuppage" }),
  (req, res) => {
    res.redirect("/blogs"); // after successful login
  }
);

// ---------- ROUTES ----------

// Home Page
app.get("/", (req, res) => {
  if (req.user) return res.redirect("/blogs");
  res.render("index");
});

app.get("/api/blog/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
});

// Blogs Page
app.get("/blogs", async (req, res) => {
  let blogs = [];
  if (req.user) {
    blogs = await Blog.find({
      $or: [
        { userId: req.user._id },{visibility: "public"}
      ]
    }).sort({ date: -1 });
  }else {
    // Guest user → show only public blogs
    blogs = await Blog.find({ visibility: "public" }).sort({ date: -1 });
  }
  res.render("Blogs", { blogs });
});

// New Blog Page
app.get("/blogs/new", (req, res) => {
  if (!req.user) return res.redirect("/signuppage");
  res.render("newBlog");
});

// Signup Page
app.get("/signuppage", (req, res) => {
  res.render("signup");
});

// Edit Blog
app.get("/blogs/:ed/edit", async (req, res) => {
  const upd = await Blog.findOne({ _id: req.params.ed });
  res.render("edit", { upd });
});

// Delete Blog
app.get("/blogs/:del/delete", async (req, res) => {
  await Blog.findOneAndDelete({ _id: req.params.del });
  res.redirect("/blogs");
});

// About page
app.get("/about", (req, res) => {
  res.render("about");
});

// Contact page
app.get("/contact", (req, res) => {
  res.render("contact");
});

// Handle contact form submission (optional: send email or store in DB)
app.post("/contact", async (req, res) => {
  // Example: just log for now
  console.log(req.body);
  res.send("Thanks for contacting us! We'll get back to you soon.");
});


// Login (JWT)
app.post("/login", async (req, res) => {
  const use = await Usermodel.findOne({ email: req.body.logemail });
  if (!use) return res.send("User not found");

  bcrypt.compare(req.body.logpassword, use.password, (err, result) => {
    if (result) {
      const token = jwt.sign({ email: use.email }, 'sshetuojslkdeuffvmdhfvnefjveu');
      res.cookie("token", token);
      res.redirect("/blogs");
    } else {
      res.send("Wrong password");
    }
  });
});

// Signup (JWT)
app.post("/signup", (req, res) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, async (err, hash) => {
      await Usermodel.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      });
      const token = jwt.sign({ email: req.body.email }, 'sshetuojslkdeuffvmdhfvnefjveu');
      res.cookie("token", token);
      res.redirect("/blogs");
    });
  });
});

// Create Blog
app.post("/blogs/create", async (req, res) => {
  if (!req.user) return res.redirect("/signuppage");

  await Blog.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: req.body.date,
    userId: req.user._id,
    visibility: req.body.visibility
  });

  res.redirect("/blogs");
});

// Update Blog
app.post("/blogs/:update", async (req, res) => {
  if (!req.user) return res.redirect("/signuppage");
  await Blog.updateMany(
    { _id: req.params.update },
    {
      $set: {
        author: req.body.author , 
        visibility: req.body.visibility 
      }
    }
  );
  res.redirect("/blogs");
});

// ---------- LOGOUT ----------
app.get("/logout", (req, res) => {
  try {
    // JWT logout
    if (req.cookies.token) {
      res.clearCookie("token");
    }

    // OAuth logout
    if (req.isAuthenticated && req.isAuthenticated()) {
      req.logout(err => {
        if (err) console.error("Logout error:", err);
        req.session.destroy(() => {
          res.redirect("/blogs");
        });
      });
      return;
    }

    res.redirect("/");
  } catch (err) {
    console.error("Logout failed:", err);
    res.redirect("/blogs");
  }
});

// ---------- SERVER ----------
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
