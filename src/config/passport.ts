/* eslint-disable @typescript-eslint/no-var-requires */
import { PrismaClient } from '@prisma/client'

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient()

module.exports = function (passport: { use: (arg0: any) => void; serializeUser: (arg0: (user: any, done: any) => void) => void; deserializeUser: (arg0: (id: any, done: any) => void) => void; }) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email: string, password: string, done: (arg0: null, arg1: any, arg2: { message: string; } | undefined) => any) => {
      // Match user
      const userByEmail = await prisma.user.findUnique({
        where: {
          email: email,
        },
      })

      if (!userByEmail) {
        return done(null, false, { message: 'That email is not registered' });
      }

      // Match password
      bcrypt.compare(password, userByEmail.password, (err: any, isMatch: any) => {
        if (err) throw err;
        if (isMatch) {
          console.log({ isMatch })
          return done(null, userByEmail, { message: 'Password match' });
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      });
    })
  );

  /**
   * Serializes the user, called after login is approved.
   * accesses the user object, resulting in data attached to the session. (Request.session.user)
   */
  passport.serializeUser((user, done) => {
    console.log({ user });
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string | number, done) => {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id.toString()) } });
    if (!user) return done('No user to deserialize');
  
    return done(null, user);
  });
};