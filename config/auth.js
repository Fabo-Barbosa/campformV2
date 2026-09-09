const localStrategy = require("passport-local");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//model de usuário
require("../models/User");
const User = mongoose.model("user");

module.exports = function (passport) {
  passport.use(
    new localStrategy(
      { usernameField: "username", passwordField: "password" },
      (username, password, done) => {
        User.findOne({ username: username }).then((user) => {
          if (!user) {
            return done(null, false, {
              message: "Usuário ou senha incorretos...",
            });
          }

          if (!user.active) {
            return done(null, false, {
              message: "Usuário Inativo.",
            });
          }

          bcrypt.compare(password, user.hash, (erro, batem) => {
            if (batem) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Usuário ou senha incorretos...",
              });
            }
          });
        });
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  });
};
