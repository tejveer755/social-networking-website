const express = require("express");
const router = express.Router();
const postModel = require("../models/post-model");
const userModel = require("../models/user-model");
const authenticateUser = require("../middleware/auth");

router.get("/", authenticateUser, async (req, res) => {
  try {
    const posts = await postModel.find().populate("userId").populate("likes");
    const user =
      req.user && (await userModel.findOne({ email: req.user.email }));
    res.render("home", { posts, user: user || null });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
