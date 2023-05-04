const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const bcrypt = require("bcrypt");
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error Message: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// API 1

app.post("/register", async (request, response) => {
  let { username, name, password, gender, location } = request.body;
  let hashedPassword = bcrypt.hash(password, 10);

  let selectUserQuery = `SELECT * FROM user WHERE username='${username}';`;
  let dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    let createUserQuery = `
        INSERT INTO
            user(username, name, password, gender, location)
        VALUES
        (
            '${username}',
            '${name}',
            '${hashedPassword}'
            '${gender}',
            '${location}'
        );`;
    if (password.length < 5) {
      response.status = 400;
      response.send("Password is too short");
    } else {
      const dbResponse = await db.run(createUserQuery);
      response.status = 200;
      response.send("User created successfully");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

// app.post("/register", async (request, response) => {
//   let { username, name, password, gender, location } = request.body; //Destructuring the data from the API call

//   let hashedPassword = await bcrypt.hash(password, 10); //Hashing the given password

//   let checkTheUsername = `
//             SELECT *
//             FROM user
//             WHERE username = '${username}';`;
//   let userData = await db.get(checkTheUsername); //Getting the user details from the database
//   if (userData === undefined) {
//     //checks the condition if user is already registered or not in the database
//     /*If userData is not present in the database then this condition executes*/
//     let postNewUserQuery = `
//                     INSERT INTO
//                     user (username,name,password,gender,location)
//                     VALUES (
//                         '${username}',
//                         '${name}',
//                         '${hashedPassword}',
//                         '${gender}',
//                         '${location}'
//                     );`;
//     if (password.length < 5) {
//       //checking the length of the password
//       response.status(400);
//       response.send("Password is too short");
//     } else {
//       /*If password length is greater than 5 then this block will execute*/

//       let newUserDetails = await db.run(postNewUserQuery); //Updating data to the database
//       response.status(200);
//       response.send("User created successfully");
//     }
//   } else {
//     /*If the userData is already registered in the database then this block will execute*/
//     response.status(400);
//     response.send("User already exists");
//   }
// });

// API 2
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

// temp API
app.get("/all/", async (request, response) => {
  const getAllQuery = `SELECT * FROM user;`;
  const dbItems = await database.all(getAllQuery);
  response.send(dbItems);
});
module.exports = app;
