const express = require("express");
const { engine } = require("express-handlebars");
const hbsHelpers = require("./helpers/handlebars");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const user = require("./routes/user");
const campanhaHsmRoute = require("./routes/campanhaHsm");
const campanhaDiscadorRoute = require("./routes/campanhaDiscador");
const clienteRoute = require("./routes/cliente");
const hsmRoute = require("./routes/hsmRouter");
const admin = require("./routes/admin");
const report = require("./routes/reports");
const isAuthenticated = require("./helpers/isAuthenticated");
const session = require("express-session");
const flash = require("connect-flash");
const Passport = require("passport");
require("./config/auth")(Passport);
const db = require("./config/db");
require("dotenv").config();
require("./models/LogCampanha");
const LogCampanha = mongoose.model("log_campanha");

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
app.get("/homepage", async (req, res) => {
  try {
    const recents = await LogCampanha.find({ finalizadoEm: { $ne: null } })
      .populate(["hsmId", "userId"])
      .sort({ createdAt: -1, _id: -1 })
      .limit(3)
      .lean();

    const schedule = await LogCampanha.find({
      $and: [{ agendamentos: { $ne: [] } }, { finalizadoEm: null }],
    })
      .populate(["hsmId", "userId"])
      .sort({ createdAt: -1, _id: -1 })
      .limit(3)
      .lean();

    res.render("index", { recents, schedule });
  } catch (error) {
    const erro = {
      erro: "Não foi possível carregar os dados de campanhas e agendamentos.",
    };
    res.render("index", { erro });
  }
});

app.use("/mensagem-hsm", campanhaHsmRoute);
app.use("/discador", campanhaDiscadorRoute);
app.use("/admin", admin);
app.use("/report", report);
app.use("/cliente", clienteRoute);
app.use("/template", hsmRoute);

// outros
const port = 5678;
const PORT = process.env.PORT || port;
app.listen(PORT, () => {
  console.log("Servidor rodando.");
});
