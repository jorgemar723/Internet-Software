import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const App = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editedBookId, setEditedBookId] = useState(null);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [editedBookDetails, setEditedBookDetails] = useState({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    avail: false,
    who: '',
    due: '',
  });

  const MONGO_URL = 'http://localhost:3001';

  const getBooks = useCallback(async () => {
    try {
      const response = await fetch(`${MONGO_URL}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }, [MONGO_URL]);

  const getAvailableBooks = useCallback(async (isAvailable) => {
    try {
      const response = await fetch(`${MONGO_URL}/books?avail=${isAvailable}`);
      const data = await response.json();
      setAvailableBooks(data);
    } catch (error) {
      console.error(`Error fetching ${isAvailable ? 'available' : 'unavailable'} books:`, error);
    }
  }, [MONGO_URL]);

  useEffect(() => {
    getBooks();
    getAvailableBooks(true);
  }, [getBooks, getAvailableBooks]);

  const getBookById = useCallback(async (bookId) => {
    try {
      const response = await fetch(`${MONGO_URL}/books/${bookId}`);
      const data = await response.json();
      setSelectedBook(data);
      setEditedBookDetails(data);
    } catch (error) {
      console.error(`Error fetching book by ID ${bookId}:`, error);
    }
  }, [MONGO_URL]);

  const editBookById = useCallback(async () => {
    if (!editedBookId) {
      alert('Please select a book by ID.');
      return;
    }

    try {
      await fetch(`${MONGO_URL}/books/${editedBookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedBookDetails),
      });

      getBookById(editedBookId);
      getBooks();
      alert(`Book ID ${editedBookId} has been updated.`);
    } catch (error) {
      console.error(`Error editing book by ID ${editedBookId}:`, error);
    }
  }, [editedBookId, editedBookDetails, MONGO_URL, getBookById, getBooks]);

  const handleEditInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    setEditedBookDetails((prevDetails) => ({
      ...prevDetails,
      [name]: inputValue,
    }));
  }, []);

  const addNewBook = useCallback(async (newBookDetails) => {
    try {
      const response = await fetch(`${MONGO_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBookDetails),
      });

      if (response.ok) {
        getBooks();
        getAvailableBooks(true);
        alert('New book added successfully.');
      } else {
        console.error('Error adding new book:', response.statusText);
        alert('Error adding new book. Please try again.');
      }
    } catch (error) {
      console.error('Error adding new book:', error);
      alert('Error adding new book. Please try again.');
    }
  }, [MONGO_URL, getBooks, getAvailableBooks]);

  const deleteBookById = useCallback(async () => {
    const inputElement = document.getElementById('deleteBookId');
    const deletedBookId = inputElement.value.trim();

    if (!deletedBookId) {
      alert('Please enter a book ID to delete.');
      return;
    }

    try {
      const response = await fetch(`${MONGO_URL}/books/${deletedBookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        getBooks();
        getAvailableBooks(true);
        alert(`Book ID ${deletedBookId} has been deleted.`);
      } else {
        const errorMessage = await response.json();
        console.error('Error deleting book:', errorMessage);
        alert(`Error deleting book: ${errorMessage}. Please try again.`);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book. Please try again.');
    }
  }, [MONGO_URL, getBooks, getAvailableBooks]);

  return (
    <div className="App">
      <div className="books-list">
        <h1>MERN Library Server</h1>
        <h3>Current Books</h3>
        {books.length > 0 ? (
          <ul>
            {books.map((book) => (
              <li key={book.id}>{`ID: ${book.id}: Title: ${book.title}`}</li>
            ))}
          </ul>
        ) : (
          <p>No books available.</p>
        )}
      </div>

      <div className="get-book-by-id">
        <h3>Get Book by ID</h3>
        <label>
          Select Book ID:
          <input
            type="number"
            onChange={(e) => getBookById(e.target.value)}
            min="1"
          />
        </label>
        {selectedBook ? (
          <div>
            <h4>{`ID: ${selectedBook.id}`}</h4>
            <p>{`Title: ${selectedBook.title}`}</p>
            <p>{`Author: ${selectedBook.author}`}</p>
            <p>{`Publisher: ${selectedBook.publisher}`}</p>
            <p>{`ISBN: ${selectedBook.isbn}`}</p>
            <p>{`Availability: ${selectedBook.avail}`}</p>
            <p>{`Checked out by: ${selectedBook.who}`}</p>
            <p>{`Due Date: ${selectedBook.due}`}</p>
          </div>
        ) : (
          <p>No book selected.</p>
        )}
      </div>

      <div className="available-books">
        <h3>Available Books</h3>
        <button onClick={() => getAvailableBooks(true)}>Show Available Books</button>
        <button onClick={() => getAvailableBooks(false)}>Show Unavailable Books</button>
        {availableBooks.length > 0 ? (
          <ul>
            {availableBooks.map((book) => (
              <li key={book.id}>{`ID: ${book.id}: Title: ${book.title}`}</li>
            ))}
          </ul>
        ) : (
          <p>No available books.</p>
        )}
      </div>

      <div className="edit-book-by-id">
        <h3>Edit Book by ID</h3>
        <label>
          Select Book ID:
          <input
            type="number"
            onChange={(e) => {
              setEditedBookId(e.target.value);
              setEditedBookDetails({});
            }}
            min="1"
          />
        </label>
        <br />
        {editedBookId && (
          <div>
            <label>
              Enter new title:
              <input
                type="text"
                name="title"
                value={editedBookDetails.title || ''}
                onChange={handleEditInputChange}
              />
            </label>
            <br />
            <label>
              Enter new author:
              <input
                type="text"
                name="author"
                value={editedBookDetails.author || ''}
                onChange={handleEditInputChange}
              />
            </label>
            <br />
            <label>
              Enter new publisher:
              <input
                type="text"
                name="publisher"
                value={editedBookDetails.publisher || ''}
                onChange={handleEditInputChange}
              />
            </label>
            <br />
            <label>
              Enter new ISBN:
              <input
                type="text"
                name="isbn"
                value={editedBookDetails.isbn || ''}
                onChange={handleEditInputChange}
              />
            </label>
            <br />
            <label>
              Enter new availability:
              <input
                type="checkbox"
                name="avail"
                checked={editedBookDetails.avail || false}
                onChange={handleEditInputChange}
              />
            </label>
            <br />
            <label>
              Enter new who checked out:
              <input
                type="text"
                name="who"
                value={editedBookDetails.who || ''}
                onChange={handleEditInputChange}
              />
            </label>
            <br />
            <label>
              Enter new due date:
              <input
                type="text"
                name="due"
                value={editedBookDetails.due || ''}
                onChange={handleEditInputChange}
              />
            </label>
            <br />
            <button onClick={editBookById}>Update Book</button>
          </div>
        )}
      </div>

      <div className="add-new-book">
        <h3>Add New Book</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newBookDetails = {
              id: e.target.id.value,
              title: e.target.title.value,
              author: e.target.author.value,
              publisher: e.target.publisher.value,
              isbn: e.target.isbn.value,
              avail: e.target.avail.checked,
              who: e.target.who.value,
              due: e.target.due.value,
            };
            addNewBook(newBookDetails);
          }}
        >
          <label>
            ID:
            <input type="text" name="id" required />
          </label>
          <br />
          <label>
            Title:
            <input type="text" name="title" required />
          </label>
          <br />
          <label>
            Author:
            <input type="text" name="author" />
          </label>
          <br />
          <label>
            Publisher:
            <input type="text" name="publisher" />
          </label>
          <br />
          <label>
            ISBN:
            <input type="text" name="isbn" />
          </label>
          <br />
          <label>
            Availability:
            <input type="checkbox" name="avail" />
          </label>
          <br />
          <label>
            Checked out by:
            <input type="text" name="who" />
          </label>
          <br />
          <label>
            Due Date:
            <input type="text" name="due" />
          </label>
          <br />
          <button type="submit">Add Book</button>
        </form>
      </div>

      <div className="delete-book-by-id">
        <h3>Delete Book by ID</h3>
        <label>
          Enter Book ID:
          <input id="deleteBookId" type="number" min="1" />
        </label>
        <br />
        <button onClick={deleteBookById}>Delete Book</button>
      </div>
    </div>
  );
};

export default App;
