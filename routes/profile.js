const express = require("express");
const userModel = require("../models/user-model");
const authenticateUser = require("../middleware/auth");
const router = express.Router();
const upload = require("../config/multerconfig");

// Profile page
router.get("/", authenticateUser, async (req, res) => {
  try {
    const user = await userModel
      .findOne({ email: req.user.email })
      .populate("posts");
    if (!user) return res.status(404).send("User not found");
    res.render("profile", { user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/uploadPhoto", authenticateUser, (req, res) => {
  res.render("uploadPhoto");
});


router.post(
  "/uploadPhoto",
  authenticateUser,
  upload.single("profilePhoto"),
  async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    user.profilePhoto = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/user/:id", authenticateUser, async (req, res) => {
  const currentUser = await userModel.findOne({ email: req.user.email });
  const user = await userModel.findById(req.params.id).populate("posts");
  if (!user) return res.status(404).send("User not found");

  return res.render("user", { user , currentUser });
});


module.exports = router;
