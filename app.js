const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const User = require("./models/user"); // Import the User model
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const app = express();
const port = 4000;
const public = path.join(__dirname, "/public");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(public));

app.use(
  session({
    key: "user_sid",
    secret: "thisisrandom",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000,
    },
  })
);

app.use((req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(`${public}/dashboard.html`);
  } else {
    next();
  }
});

var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(`${public}/dashboard.html`);
  } else {
    next();
  }
};

app.route("/login").get(sessionChecker, (req, res) => {
  res.sendFile(`${public}/login.html`);
})
.post(async (req, res) => {
    var username = req.body.username;

    try{
       var user = await User.findOne({username:username}).exec();
       var password = await bcrypt.hash(req.body.password, 10);
       console.log(password);
       console.log(user.password);
       if(!user){
        console.log("password incorrect")
        return res.redirect("/login");
        // return;
       }
      const isMatched = await bcrypt.compare(password, user.password);
      console.log(isMatched)
      if(isMatched){
        req.session.user = user; // corrected line
        res.redirect("/dashboard")
      }
      res.redirect("/login")
    }catch(err){
    console.log(err)
    }

});

app.get("/logout", (req, res) => {
  // console.log(req)
  res.clearCookie("user_sid")
  res.redirect("/login");
  

  // if (req.session.user && req.cookies.user_sid) {
  //   req.session.user = null;
  //   req.session.destroy((err) => { // corrected line
      
  //     if (err) {
  //       return res.status(400).end();
  //     } else {
  //       res.status(200).end();
  //       res.clearCookie("user_sid");
  //       res.redirect("/");
  //       }  
  //   });
  //   res.redirect("/login");
  // } else {
  //   res.redirect("/login");
  // }
});


app
  .route("/signUp")
  .get(sessionChecker, (req, res) => {
    res.sendFile(`${public}/signUp.html`);
  })
  .post(async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    req.session.user = savedUser;
    res.redirect("/dashboard");
  });

app.get("/", (req, res) => {
  res.sendFile(`${public}/home.html`);
});

app.get("/dashboard", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(`${public}/dashboard.html`);
  } else {
    res.sendFile(`${public}/login.html`);
  }
});

app.get("/login", sessionChecker, (req, res) => {
  res.sendFile(`${public}/login.html`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

mongoose
  .connect("mongodb://127.0.0.1:27017/auth", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
