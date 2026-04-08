const localStrategy = require('passport-local');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//model de usuário
require('../models/User');
const User = mongoose.model('user');

module.exports = function(passport) {

    passport.use(new localStrategy({usernameField: 'email', passwordField: 'password'}, (email, password, done) => {

        User.findOne({email: email}).then((user) => {
            if (!user) {
                return done(null, false, {message: "Esta conta não existe!"})
            }

            bcrypt.compare(password, user.hash, (erro, batem) => {

                if (batem) {
                    return done(null, user)
                } else {
                    return done(null, {message: "Senha incorreta."})
                }
            })
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => {
            done(null, user)
        }).catch(err => {
            done(err, null)
        })
    })
}