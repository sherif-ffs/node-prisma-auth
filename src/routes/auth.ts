import { PrismaClient } from '@prisma/client'
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';

const prisma = new PrismaClient()
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', function (err, user) {
    // Handle Error
    if (err) {
      console.log({ err })
      return res.json({ status: 'error', error: 'something went wrong' });
    }

    if (!user) return res.json({ status: 'error', error: 'user not found' });

    req.login(user, function (err) {
      if (err) {
        return res.json({ status: 'error', error: 'something went wrong' });
      }

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
        },
        JWT_SECRET as string
      );

      const responseData = {
        token: token,
        user: user,
        authenticated: req.isAuthenticated(),
      };
      return res.json({ status: 'ok', data: responseData });
    });
  })(req, res, next);
});

// Signup
router.post('/signup', async (req, res) => {
  const { email, password: plainTextPassword, name } = req.body;
  const password = await bcrypt.hash(plainTextPassword, 10);
  try {
    const user = await prisma.user.create({ data: {
      name: name,
      email: email,
      password: password
    }})

    if (user) res.json({ status: 'ok', data: user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.json({ status: 'error', error: 'Account with email already exists' });
    }

    return res.json({ status: 'error', error: 'Something went wrong' });
  }
});

module.exports = router;