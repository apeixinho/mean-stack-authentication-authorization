const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const dbConfig = require("./app/config/db.config");

const app = express();

// app.use(cors());
/* for Angular Client (withCredentials) */
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true
  })
);

const db = require("./app/models");
const mongoose = require("mongoose");
const Role = db.role;
let mongoConnection;

(async () => {
    try {
        mongoConnection = await  mongoose.connect(
          "mongodb://" +
          dbConfig.USER +
          ":" +
          dbConfig.PASSWORD +
          "@" +
            dbConfig.HOST +
            ":" +
            dbConfig.PORT +
            "/" +
            dbConfig.DB
        );
        // mongoConnection = await mongoose.connect(
        //     `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`
        // );
        console.log("Connected to Mongo database");
        await initial();
    } catch (error) {
        console.error("Connection to Mongo database failed!", error);
    }
})();

// const { from, of } = require('rxjs');
// const { switchMap, tap, catchError } = require('rxjs/operators');
//
// from(db.mongoose.set('strictQuery', false))
//   .pipe(
//     switchMap(() => from(db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     }))),
//     tap(() => console.log('Successfully connected to MongoDB')),
//     tap(initial),
//     catchError(err => {
//       console.error('Connection error', err);
//       return of(process.exit());
//     })
//   )
//   .subscribe();


// db.mongoose.set('strictQuery', false);
// db.mongoose
//   .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   })
//   .then(() => {
//     console.log("Successfully connected to MongoDB.");
//     initial();
//   })
//   .catch(err => {
//     console.error("Connection error", err);
//     process.exit();
//   });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

async function initial() {
    await mongoConnection;
    const count = await Role.estimatedDocumentCount();

  if (count === 0) {
    try {
      await Promise.all([
        new Role({ name: 'user' }).save(),
        new Role({ name: 'moderator' }).save(),
        new Role({ name: 'admin' }).save()
      ]);
      console.log('Roles added');
    } catch (err) {
      console.error('Error adding roles', err);
    }
  }
}


// function initial() {
//   Role.estimatedDocumentCount((err, count) => {
//     if (!err && count === 0) {
//       new Role({
//         name: "user"
//       }).save(err => {
//         if (err) {
//           console.log("error", err);
//         }
//
//         console.log("added 'user' to roles collection");
//       });
//
//       new Role({
//         name: "moderator"
//       }).save(err => {
//         if (err) {
//           console.log("error", err);
//         }
//
//         console.log("added 'moderator' to roles collection");
//       });
//
//       new Role({
//         name: "admin"
//       }).save(err => {
//         if (err) {
//           console.log("error", err);
//         }
//
//         console.log("added 'admin' to roles collection");
//       });
//     }
//   });
// }
