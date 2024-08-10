const express = require('express');
const app = express();
const userModel = require("./models/user");
const postmodel = require("./models/post");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


app.get('/', (req, res) =>{
    res.render("index");
});

app.get('/login', (req, res) =>{
    res.render("login");
});


app.post("/register", async(req, res) =>{
    let {email, password,username,name,age}=req.body;
   let user=await userModel.findOne({email})
   if(user) return res.status(304).send("User already register ");

   bcrypt.genSalt(10, (err,salt)=>{
    bcrypt.hash(password, salt, async (err, hash)=>{
        let user=await userModel.create({
            name,
            username,
            email,
            age,
            password: hash
        });

        let token =jwt.sign({email: email, userid: user._id},"shhhh");
        res.cookie("token",token);
        res.send("Registered");
       }) 
    })
  
});


app.post("/login", async(req, res) =>{
    let {email, password}=req.body;
   let user=await userModel.findOne({email})
   if(!user) return res.status(500).send("Something went wrong");

    bcrypt.compare(password, user.password, function(err,result){
        if(result) res.status(200).send("you can login");
        else res.redirect("/login");
    })
    
});

const PORT=8001;
app.listen(PORT, console.log(`Server started on port ${PORT}`));