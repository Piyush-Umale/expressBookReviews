/*const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
*/

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Check if username is valid (exists)
 */
const isValid = (username) => {
  return users.some(user => user.username === username);
};

/**
 * Check if username & password match
 */
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

/**
 * Register a new user
 */
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Missing fields
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // User already exists
  if (isValid(username)) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  // Register user
  users.push({ username, password });

  return res.status(201).json({
    message: "User successfully registered"
  });
});

/**
 * Login route
 */
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Missing credentials
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // Invalid credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  // Generate JWT
  const accessToken = jwt.sign(
    { username },
    "access",
    { expiresIn: "1h" }
  );

  // Save token in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: "User successfully logged in",
    token: accessToken
  });
});

/**
 * Add or modify book review
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  // User not logged in
  if (!username) {
    return res.status(401).json({
      message: "User not logged in"
    });
  }

  // Book not found
  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  // Review missing
  if (!review) {
    return res.status(400).json({
      message: "Review is required"
    });
  }

  // Add/update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully"
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;