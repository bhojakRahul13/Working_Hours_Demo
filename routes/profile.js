const express = require("express");
const router = express();
const auth = require("../middleware/auth");
const { check, validationResult, body } = require("express-validator");

const Profile = require("../models/profiles");
const User = require("../models/Users");
const { Error } = require("mongoose");

// @route Get  profile/me
// @desc Get current user profile
// @access  Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "email"]); //populate  to add user fileds

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
});

// @route  Post  profile
// @desc  post current user profile
// @access  Private

router.post(
  "/",
  [
    auth,
    [
      check(
        "total_hours",
        "total_hours is required and it should be number only"
      )
        .not()
        .isEmpty()
        .isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findById(req.user.id).select("-password");

    const { total_hours } = req.body;

    const profileFileds = { name: user.name };

    profileFileds.user = req.user.id;

    if (total_hours) profileFileds.total_hours = total_hours;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //update profile also
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFileds },
          { new: true }
        );
        console.log("user", req.user.id);
        return res.json(profile);
      } else {
        //Create profile
        profile = new Profile(profileFileds);
        await profile.save();
        return res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("server Error");
    }
  }
);

// @route  Get  profile
// @desc  Get All user profile
// @access  Public

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    let profiles = await Profile.find()
      .populate("user", ["name", "email"])
      .limit(limit * 1)
      .skip((page - 1) * limit);
    console.log(req.body);
    return res.json({ total_User: profiles.length, profiles });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server Error");
  }
});

// @route  Get  profile/user/:user_id
// @desc  Get user profile by ID
// @access  Public

router.get("/user/:user_id", async (req, res) => {
  try {
    let profiles = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "email"]);

    if (!profiles) return res.status(400).json("Profile Not Found User");
    return res.json(profiles);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json("Profile Not Found User");
    }

    return res.status(500).send("server Error");
  }
});

// @route  Delete  profile
// @desc  Delete profile, user & posts
// @access  Private

router.delete("/user", auth, async (req, res) => {
  try {
    //remove user posts
    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //remove user
    await User.findOneAndRemove({ _id: req.user.id });
    return res.json({ msg: "User Deleted" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server Error");
  }
});

// @route  Post/profile/hours
// @desc  Add profile hours
// @access  Private

router.post(
  "/hours",
  [
    auth,
    [
      check("hours", "hours is required and it should be number only")
        .not()
        .isEmpty()
        .isNumeric(),
      check(
        "description",
        "description is required and it sould be number only"
      )
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //to show errors
    }

    const { hours, description } = req.body;

    console.log(req.body);
    //Create new obj for working and description

    const newWork = { hours, description };
    hours;
    console.log("newWork", newWork);

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.working_hours.unshift(newWork);

      console.log("profile", req.body.hours);
      console.log("profi111le", profile.total_hours);

      if (profile.total_hours <= 0) {
        return res.json({ msg: "your total working hrs is done!", profile });
      } else if (
        Number(profile.total_hours) - Number(req.body.hours) < 0 ||
        Number(req.body.hours) <= 0
      )
        return res.json({
          msg: "Invalid working hours  you enter !",
          total_hours_remaining: profile.total_hours,
        });
      else {
        profile.total_hours =
          Number(profile.total_hours).toFixed(2) - Number(req.body.hours);
        await profile.save();
      }

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ errors: errors.array() });
    }
  }
);

// @route  Delete  profile working hours
// @desc  Delete profile hours,and add it to total_hours
// @access  Private

router.delete("/hours/:id", auth, async (req, res) => {
  try {
    //find user profile if there or not
    const user = await Profile.findOne({ user: req.user.id });
    //if not user mess.
    if (!user) return res.status(400).send("No user found!");
    //if user is there ,find working hours  with id.
    let hours = user.working_hours.filter((hrs) =>
      hrs._id.equals(req.params.id)
    );
    if (hours.length === 0) return res.status(400).send("No such entry found!");

    const deducted_hours = hours[0].hours;
    hours = user.working_hours.filter((hrs) => !hrs._id.equals(req.params.id));
    user.working_hours = hours;
    user.total_hours += Number(deducted_hours);
    await user.save();

    return res.json({
      msg: "Hours Deducted",
      total_hours_remaining: user.total_hours,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server Error");
  }
});

module.exports = router;
