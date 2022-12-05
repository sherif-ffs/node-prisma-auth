import { PrismaClient } from '@prisma/client'
import express from 'express';
import passport from 'passport';
import session from 'express-session';
require('./config/passport')(passport);

const cors = require('cors');
const prisma = new PrismaClient()
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(
  session({
    secret: 'RU8VNbftc4TSMb4bXP3l3YlNWACwyXPGffz5aXHc6lty1Y2t4SWRqGterag',
    resave: false,
    saveUninitialized: false,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

async function main() {
  console.log("Connected to prisma")
}

main()
  .catch(e => {
    console.error(e.message)
  })
  .finally(async () => {
    console.log("Disconnected from prisma")
    await prisma.$disconnect
  })

app.get("/", (req, res) => {
  res.send("hey");
});

// Authentication routes
app.use('/auth', require('./routes/auth.ts'));

const port = process.env.PORT;
app.listen(port, () => console.log(`listening on port: ${port}`));