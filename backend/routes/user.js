const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post(
  '/register',
  [
    check('username').not().isEmpty().withMessage('Username is required'),
    check('email').isEmail().withMessage('Invalid Email Address'),
    check('password')
      .isLength({ min: 6, max: 12 })
      .withMessage('your password should have min and max length between 6-12')
      .matches(/\d/)
      .withMessage('your password should have at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('your password should have at least one special character')
      .matches(/[A-Z]/)
      .withMessage('your password must contain atleast one capital letter'),
  ],
  async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(401).send({ error: errors.array() });
      }
      let usernameExists = await User.findOne({ username });
      let emailExists = await User.findOne({ email });

      if (usernameExists) {
        return res.status(401).send({ error: [{ msg: 'Username Exists' }] });
      }

      if (emailExists) {
        return res.status(401).send({ error: [{ msg: 'Email  Exists' }] });
      }

      if (password !== confirmPassword) {
        return res
          .status(401)
          .send({ error: [{ msg: "Password Does'nt Match" }] });
      }

      let user = new User({
        username,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, process.env.JWT_SECRET, async (err, token) => {
        if (err) throw Error(err);

        res.status(200).json(token);
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('server error');
    }
  }
);

router.post(
  '/login',
  [
    check('username').not().isEmpty().withMessage('Username is required'),
    check('password').not().isEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const { username, password } = req.body;

    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(401).send({ error: errors.array() });
      }
      let user = await User.findOne({ username });

      if (!user) {
        return res
          .status(401)
          .send({ error: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(401)
          .send({ error: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, process.env.JWT_SECRET, async (err, token) => {
        if (err) throw Error(err);

        res.status(200).json(token);
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('server error');
    }
  }
);

module.exports = router;
