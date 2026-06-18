const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// public_users.post("/register", (req,res) => {
//   //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});
// });

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // Check if user already exists
  if (isValid(username)) {
    return res.status(409).json({
      message: "Username already exists"
    });
  }

  // Register the user
  users.push({ username, password });

  return res.status(201).json({
    message: "User registered successfully"
  });
});





// Get the book list available in the shop
public_users.get('/',function (req, res) {

  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  if(books[isbn]){
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }else{
  return res.status(400).json({message: "Book not found"});
 }});
  
// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//   let author = req.params.author;
  
//   let filteredAuthor = books[author].filter((book)=> book.author === author);

//   if(filteredAuthor){
//     return res.status(200).send(JSON.stringify(filteredAuthor, null, 4));
//   }
// });

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let result = [];

    for (let isbn in books) {
        [books[isbn]].filter(book => {
            if (book.author === author) {
                result.push({ [isbn]: book });
            }
        });
    }

    if (result.length > 0) {
        return res.status(200).send(JSON.stringify(result, null, 4));
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});
// });

// Get all books based on title
public_users.get("/title/:title", (req, res) => {
  const title = decodeURIComponent(req.params.title);
  const result = [];

  for (let isbn in books) {
    if (books[isbn].title === title) {
      result.push({
        isbn,
        ...books[isbn]
      });
    }
  }

  if (result.length === 0) {
    return res.status(404).json({
      message: "No books found with this title"
    });
  }

  res.status(200).json(result);
});

//  Get book review
// public_users.get('/review/:isbn',function (req, res) {
//   //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});
// });

public_users.get('/review/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  let reviews = null;

  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title) {
      reviews = books[isbn].reviews;
      break;
    }
  }

  if (reviews) {
    return res.status(200).send(JSON.stringify(reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found or no reviews" });
  }
});

module.exports.general = public_users;
