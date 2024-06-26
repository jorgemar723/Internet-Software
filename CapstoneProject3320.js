//I used MongoDB Compass for this assignment and used my connection string which is listed below
//I made a database called MongoDBBooks with a collection called Capstonebooks which has the 
//6 books from the collection which we used during our Express assignment plus 4 more that I 
//initalized to the collection.

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3001;

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === "OPTIONS") res.sendStatus(200);
  else next();
});

app.use(bodyParser.json());

let cs = "mongodb+srv://Jorge078:JmMongo07@atlascluster.fmcwmnt.mongodb.net/";
let db;
let books;

async function start() {
  try {
    const client = new MongoClient(cs);
    await client.connect();
    db = client.db("MongoDBbooks");
    books = db.collection("Capstonebooks");
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error connecting to Mongo:", error);
  }
}

start();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the MERN Library Server');
});

//gets books based on avaliability
app.get('/books', async (req, res) => { 
  const { avail } = req.query;

  try {
    let query = {};
    if (avail) {
      query.avail = avail === 'true';
    }

    const booksData = await books.find(query, { projection: { _id: 0 } }).toArray();
    res.status(200).json(booksData);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(404).json({ error: 'Books not found' });
  }
});

//gets all books from the database
app.get('/books', async (req, res) => {
  try {
    const projection = { _id: 0, id: 1, title: 1 }; 

    const booksData = await books.find({}, projection).toArray();

    if (booksData.length === 0) {
      res.status(404).json({ error: 'No books found' });
    } else {
      res.status(200).json(booksData);
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(404).json({ error: 'No books found' });
  }
});


//gets one book based on id
app.get('/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const bookData = await books.findOne({ id: bookId }, { projection: { _id: 0 } });

    if (!bookData) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.status(200).json(bookData);
    }
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    res.status(404).json({ error: 'Book not found' });
  }
});


//allows for a new book to be checked in/added to the database
app.post('/books', async (req, res) => {
  const newBook = req.body;

  try {
    const existingBook = await books.findOne({ id: newBook.id });

    if (existingBook) {
      return res.status(403).json({ error: 'Book already exists' });
    }

    await books.insertOne(newBook);
    console.log('New book added/Created');
    return res.status(201).json({ message: 'Created' });
  } catch (error) {
    console.error('Error adding new book:', error);
    return res.status(403).json({ error: 'Book creation failed' });
  }
});



//allows for a book's details to be edited
app.put('/books/:id', async (req, res) => {
  try {
    const existingBook = await books.findOne({ id: req.params.id });

    if (!existingBook) {
      res.status(404).send('Not Found');
    } else {
      const updatedBook = await books.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { returnDocument: 'after' }
      );

      if (updatedBook) {
        console.log('Book updated:', updatedBook);
        res.status(200).send('Updated');
      } else {
        res.status(404).send('Not Found');
      }
    }
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(404).send('Not Found');
  }
});

//deletes/checks out a book from the database
app.delete('/books/:id', async (req, res) => {
  try {
    const result = await books.deleteOne({ id: req.params.id });
    if (result.deletedCount > 0) {
      res.send('Deleted');
    } else {
      res.status(204).send('Not Found');
    }
  } catch (error) {
    res.status(404).json({ error: 'Error' });
  }
});




	