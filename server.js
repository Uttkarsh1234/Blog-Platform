const express = require('express');
const app = express();
const path = require('path');
const Usermodel = require("./mongodb/mongo");
const model = require("./mongodb/mongo2");
const bcrypt = require('bcrypt');
const cookie = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');

app.get("/",(req,res)=>{
    res.render("index");
})
app.get("/blogs",async (req,res)=>{
    const blogs = await model.find().sort({ date: 1 }); // fetch from DB, newest first
    res.render("Blogs", { blogs }); // pass blogs to EJS template
})
app.get("/blogs/new",(req,res)=>{
    res.render("newBlog");
})

app.get("/signuppage",(req,res)=>{
    res.render("signup");
})

app.get("/login",async (req,res)=>{
    const user = await Usermodel.findOne({email: req.query.logemail});
    if(!user){
        res.send("User not found");
    }
    else{
        bcrypt.compare(req.query.logpassword,user.password,(err,result)=>{
            if(result){
                return res.redirect("/blogs");
            }
            else{
                res.send("Something went wrong");           
            }
        });
    }
})

app.post("/signup",(req,res)=>{
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(req.body.password,salt,async (err,hash)=>{
            let user = await Usermodel.create({
                name: req.body.name,
                email: req.body.email,
                password: hash
            })
            let token = jwt.sign({email: req.body.email},'sshetuojslkdeuffvmdhfvnefjveu');
            res.cookie("token", token);
            res.redirect("/blogs");
        })
    })
})

app.post("/blogs/create",async (req,res)=>{
    let user = await model.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        date: req.body.date
    })
    res.redirect("/blogs");
})

app.listen(3000);