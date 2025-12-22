require("dotenv").config();
const connectDB = require("./config/db")
connectDB();
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
const community = require("./models/community");
require("./config/passport"); // your Google OAuth strategy file

// Contact Mails
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const ContactMessage = require('./models/meassage');
const { sendContactMail } = require('./utils/mailer');

// basic rate-limiter for contact form: max 5 requests per IP per hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: "Too many contact requests from this IP, please try again after an hour."
});


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
  if (req.user){
    const user = req.user;
    return res.render("index",{ user });
  } 
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

app.get("/community", async (req,res)=>{
  try {
    const members = await community.find({ isCommunityMember: true });
    res.render("community", { members });
  } catch (err) {
    console.error("Error fetching community members:", err);
    res.status(500).send("Error loading community page");
  }
});

app.post("/join-community", async (req,res)=>{
  try{
    if(!req.user) return res.redirect("/signuppage");

    let member = await community.findOne({ email: req.user.email });
    if (!member) {
      await community.create({
        name: req.user.name || "Anonymous",
        email: req.user.email,
        profilePic: req.user.profilePic || "https://i.ibb.co/4pDNDk1/avatar.png",
        isCommunityMember: true
      });
    }
    res.redirect("/community");
  }catch (err) {
    console.error("Join community error:", err);
    res.status(500).send("Something went wrong joining the community.");
  }

})
// Contact GET page (if you used contact.ejs)
app.get('/contact', (req, res) => {
  res.render('contact', { user: req.user });
});

// Handle contact submissions
app.post('/send-message', contactLimiter, async (req, res) => {
  try {
    const { name = '', email = '', message = '' } = req.body;

    const senderEmail = req.user?.email || email; // if logged in, use their email; else form email
    const senderName = req.user?.name || name;

    // Basic validation
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) {
      return res.status(400).send('Please fill all fields.');
    }
    if (!validator.isEmail(senderEmail)) {
      return res.status(400).send('Please provide a valid email address.');
    }
    if (message.length > 5000) {
      return res.status(400).send('Message is too long.');
    }

    // Save to DB
     const contact = await ContactMessage.create({
      name: senderName.trim(),
      email: senderEmail.trim(),
      message: message.trim(),
      ip: req.ip
    });

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER, // fixed Gmail account (app account)
        pass: process.env.EMAIL_PASS
      }
    });

    // ✅ Compose the email dynamically
    const mailOptions = {
      from: `"${senderName}" <${process.env.EMAIL_USER}>`, // use your app account, but show user’s name
      replyTo: senderEmail, // <-- this allows receiver to reply directly to the user
      to: process.env.CONTACT_TO,
      subject: `📩 New Contact Message from ${senderName}`,
      html: `
        <h3>New Message from ${senderName}</h3>
        <p><strong>Email:</strong> ${senderEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Message sent from ${senderEmail}`);
    return res.redirect('/contact-response');
  } catch (err) {
    console.error('❌ Contact submission error:', err);
    return res.status(500).send('Something went wrong. Try again later.');
  }
});

// ✅ Success route (after form submission)
app.get('/contact-response', (req, res) => {
  res.render('contact-success', {
    user: req.user,
    message: "Thanks for contacting us! We'll get back to you soon."
  });
});

// Handle contact form submission (optional: send email or store in DB)





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
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
});




