const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("models/user-model");

const router = express.Router();

// Encrypt password utility
const encryptPass = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

router
  .route("/signup")
  .get((req, res) => res.render("signup"))
  .post(async (req, res) => {
    const { username, email, password, age, contact_num } = req.body;
    try {
      if (await userModel.findOne({ email }))
        return res.send("Email already exists");
      if (await userModel.findOne({ username }))
        return res.send("Username already exists");

      const encryptedPassword = await encryptPass(password);
      const user = await userModel.create({
        username,
        email,
        password: encryptedPassword,
        age,
        contact_num,
      });
      const token = jwt.sign({ email, userId: user._id }, "ishuashu");
      res.cookie("token", token);

      res.redirect("/");
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).send("An error occurred during signup");
    }
  });

router
  .route("/login")
  .get((req, res) => res.render("login"))
  .post(async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) return res.send("Invalid credentials");

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (isMatch) {
        const token = jwt.sign(
          { email: req.body.email, userId: user._id },
          "ishuashu"
        );
        res.cookie("token", token);
        res.redirect("/");
      } else {
        res.send("Invalid credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).send("An error occurred during login");
    }
  });

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
