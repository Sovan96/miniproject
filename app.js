const express = require('express');
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload =require('./config/multerconfig');
const path=require('path');
const crypto =require('crypto');
const multer=require('multer');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());


app.get('/', (req, res) =>{
    res.render("index");
});

app.get('/profile/upload', (req, res) =>{
    res.render("profileupload");
});

app.post('/upload', isLoggedIN,upload.single("image"),async (req, res) =>{
    console.log(user);
  let user=await userModel.findOne({email: req.user.email});
  user.profilepic=req.file.filename;
  await user.save();
  res.redirect("/profile");
});

app.get('/login', (req, res) =>{
    res.render("login");
});

app.get('/profile', isLoggedIN, async (req, res) =>{
      let user=await userModel.findOne({email: req.user.email}).populate("post");
      res.render("profile",{user});
});




app.post('/post', isLoggedIN, async (req, res) =>{
    let user=await userModel.findOne({email: req.user.email});
    let {content}=req.body;
    let post=await postModel.create({
        user:user._id,
        content: content
    });
    user.post.push(post._id);
    await user.save();
    res.redirect("/profile");
});


app.post("/register", async(req, res) =>{
    let {email, password,username,name,age}=req.body;
   let user=await userModel.findOne({email})
   if(user) return res.status(304).send("User already register ");
   
     //res.redirect('/profile');
     

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
        let token =jwt.sign({email: email, userid: user._id},"shhhh");
        res.cookie("token",token);
        if(result) res.status(200).redirect("/profile");
        else res.redirect("/login");
    })
    
});

app.get('/logout', (req, res) =>{
    res.cookie("token", "");
    res.redirect("/login");
});

function isLoggedIN(req,res,next){
    if(req.cookies.token==="") res.send("You must be loggedin");
    else{
       let data= jwt.verify(req.cookies.token,"shhhh");
       req.user=data;
    }
    next();
}

const PORT=8001;
app.listen(PORT, console.log(`Server started on port ${PORT}`));