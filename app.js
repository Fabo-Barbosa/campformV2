const express = require("express");
const { engine } = require("express-handlebars");
const hbsHelpers = require("./helpers/handlebars");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const user = require("./routes/user");
const campanha = require("./routes/campanhas");
const admin = require("./routes/admin");
const isAuthenticated = require("./helpers/isAuthenticated");
const session = require("express-session");
const flash = require("connect-flash");
const Passport = require("passport");
require("./config/auth")(Passport);
const db = require("./config/db");
require("dotenv").config();

// Config
// sessão
app.use(
  session({
    secret: process.env.SECRET || "hashdeteste",
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(Passport.initialize());
app.use(Passport.session());
app.use(flash());
// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user ? req.user.toObject() : null;
  next();
});
// Body-Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// handlebars
app.engine(
  "handlebars",
  engine({ defaultLayout: "main", helpers: hbsHelpers }),
);
app.set("view engine", "handlebars");
// Mongoose
mongoose
  .connect(db.mongoURI)
  .then(() => {
    console.log("Conectado ao mongo.");
  })
  .catch((err) => {
    console.log("Ocorreu um erro ao tentar se conectar ao mongo:" + err);
  });
// public static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  if (user) res.redirect("/homepage");
  else res.redirect("/user/login");
});
app.use("/user", user);
app.use(isAuthenticated);

// Routes
app.get("/homepage", (req, res) => {
  res.render("index");
});

app.use("/campanha", campanha);
app.use("/admin", admin);

// outros
const port = 5678;
const PORT = process.env.PORT || port;
app.listen(PORT, () => {
  console.log("Servidor rodando.");
});
