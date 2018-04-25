const alert = require('alert-node');
const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const sgMail = require('@sendgrid/mail');
const stripe = require("stripe")("sk_test_YkMA09JYhBueEZJsObqSjAYu");


module.exports = {
  signup(req, res, next){
    res.render("users/signup");
  },

  create(req, res, next){
    let newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to:  `${req.body.email}`,
      from: 'kwena@mokgohlwa.com',
      subject: 'Sign-Up Confirmend',
      text: `Welcome to Crocipedia \n\n Your Username is: ${req.body.username} \n\n Your Email Address is: ${req.body.email} \n\n Your password is: ${req.body.password}`,
      html: `<p>Welcome to Crocipedia</p> <br> <p>Your Username is: ${req.body.username}</p> <p>Your Email Address is: ${req.body.email}</p> <p>Your password is: ${req.body.password}</p>`,
    };

    userQueries.createUser(newUser, (err, user) => {
      if(err){
        req.flash("error", err);
        res.redirect("/users/signup");
      } else {
        passport.authenticate("local")(req, res, () => {
          req.flash("notice", "You've successfully signed in!");
          sgMail.send(msg);
          res.redirect("/");
        })
      }
    });
  },

  signInForm(req, res, next){
    res.render("users/signin");
  },

  signIn(req, res, next){
    passport.authenticate("local")(req, res, function () {
      if(!req.user){
        req.flash("notice", "Sign in failed. Please try again.")
        res.redirect("/users/signin");
      } else {
        req.flash("notice", "You've successfully signed in!");
        res.redirect("/");
      }
    })
  },

  signOut(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  },

  upgrade(req, res, next){

    const token = req.body.stripeToken; // Using Express

    const charge = stripe.charges.create({
      amount: 1500,
      currency: 'usd',
      description: 'Premium Account',
      source: token,
    });

    let updatedUser = {
      username: req.user.username,
      email: req.user.email,
      password: req.user.password,
      role: 1
    };

    userQueries.updateUser(req, updatedUser, (err, user) => {
      if(err || user == null){
        res.redirect(401, "/");
      } else {
        req.flash("notice", "You've successfully upgraded your account!");
        res.redirect("/");
      }
    });

  },

  downgrade(req, res, next){
    alert("Your private Wikis will be changed to Public Wikis!");
    let updatedUser = {
      username: req.user.username,
      email: req.user.email,
      password: req.user.password,
      role: 0
    };

    userQueries.updateUser(req, updatedUser, (err, user) => {
      if(err || user == null){
        res.redirect(401, "/");
      } else {
        req.flash("notice", "You've successfully downgraded your account!");
        res.redirect("/");
      }
    });
  }

}
