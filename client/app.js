require("dotenv").config();
const express = require("express");
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const extractJWT = require("passport-jwt").ExtractJwt;
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const __dirname=path.dirname("");
const buildPath=path.join(__dirname,"../client/build")
app.use(express.static(buildPath))
app.get("/*",function(req,res){
  res.sendFile(path.join(__dirname,"../client/build/index.html"),
  function(err){
    if (err){

      res.status(500).send(err);
    }
  })
})
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");

const app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
const mongoDB = 'mongodb://127.0.0.1:27017/mm'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

// Checks username and password
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await Author.findOne({ username });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const validate = await user.isValidPassword(password);

        if (!validate) {
          return done(null, false, { message: "Wrong Password" });
        }

        return done(null, user, { message: "Logged in Successfully" });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      secretOrKey: "w1x43pMOwTRES-DV5QBhREEMEbAiX9uMCXh3-jYMbBWe9B7urXGaQSaxU_7RrFimj8pkANr2tUNq-FAL-qz-1haWol26EHpfwzf68udLeL7pYRUCE6L_y7Y8EwVWob3bWKWrqoX7uuWG5H5Pv3lOmzXHk7_O_IAYuZv9DyxkIAc",
      jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// sessions and serialization
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});

module.exports = app;
