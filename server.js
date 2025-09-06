const express = require('express');
const app = express();
const path = require('path');
const Usermodel = require("./mongodb/mongo");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');

app.get("/",(req,res)=>{
    res.render("signup");
})

app.post("/create",async (req,res)=>{
    let user = await Usermodel.create({
        name: `${req.body.name}`,
        email: `${req.body.email}`,
        password: `${req.body.password}`
    })
})
app.listen(3000);