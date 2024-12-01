const express = require("express");
const postModel = require("models/post-model");
const userModel = require("models/user-model");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

router.get("/create", authenticateUser, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });

  res.render("create", { user });
});
// Create a new post
router.post("/create", authenticateUser, async (req, res) => {
  try {
    const { postData } = req.body;
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).send("User not found");

    const post = await postModel.create({ postData, userId: user._id });
    user.posts.push(post._id);
    await user.save();

    res.redirect("/profile");
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).send("Server Error");
  }
});

router.get("/delete/:id", authenticateUser, async (req, res) => {
  try {
    // Find the post by ID
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Ensure the user requesting the deletion is the post's owner
    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).send("Unauthorized action");
    }

    // Delete the post from the database
    await postModel.findByIdAndDelete(req.params.id);

    // Remove the post reference from the user's posts array
    await userModel.updateOne(
      { _id: req.user.userId },
      { $pull: { posts: req.params.id } }
    );

    res.redirect("/profile");
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).send("Failed to delete post");
  }
});

// Like/unlike a post
router.post("/like/:id", authenticateUser, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    const userId = req.user.userId;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();

    res.redirect("/");
  } catch (error) {
    console.error("Like Post Error:", error);
    res.status(500).send("Failed to like post");
  }
});

// Edit a post
router.get("/edit/:id", authenticateUser, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    res.render("edit", { user: req.user, post });
  } catch (error) {
    console.error("Fetch Post Error:", error);
    res.status(500).send("Failed to fetch post");
  }
});

router.post("/edit/:id", authenticateUser, async (req, res) => {
  try {
    await postModel.findByIdAndUpdate(req.params.id, {
      postData: req.body.postData,
    });
    res.redirect("/profile");
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).send("Failed to update post");
  }
});

module.exports = router;
