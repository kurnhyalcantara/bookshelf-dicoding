const {nanoid} = require('nanoid');
const books = require('./books');

const addBookHandler = (req, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = req.payload;
  if (!name) {
    return h
        .response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        })
        .code(400);
  }
  if (readPage > pageCount) {
    return h
        .response({
          status: 'fail',
          message:
          'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        })
        .code(400);
  }
  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (!isSuccess) {
    return h
        .response({
          status: 'error',
          message: 'Buku gagal ditambahkan',
        })
        .code(500);
  } else {
    return h
        .response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        })
        .code(201);
  }
};

const getAllBooksHandler = (req, h) => {
  const {name, reading, finished} = req.query;
  let bookLists = _listBookHelper(books);
  if (name) {
    const queryName = name.toLowerCase();
    const filterBookWithNameKey = books.map((book) => book.name.toLowerCase());
    const splitNameKey = filterBookWithNameKey.map((key) => key.split(' '));

    for (let i = 0; i < books.length; i++) {
      books[i].name = splitNameKey[i];
    }

    const result = books.filter((book) => book.name.includes(queryName));
    bookLists = _listBookHelper(result);
  }

  if (reading === '1') {
    const filterBook = books.filter((book) => book.reading === true);
    bookLists = _listBookHelper(filterBook);
  } else if (reading === '0') {
    const filterBook = books.filter((book) => book.reading === false);
    bookLists = _listBookHelper(filterBook);
  }

  if (finished === '1') {
    const filterBook = books.filter((book) => book.finished === true);
    bookLists = _listBookHelper(filterBook);
  } else if (finished === '0') {
    const filterBook = books.filter((book) => book.finished === false);
    bookLists = _listBookHelper(filterBook);
  }

  return h
      .response({
        status: 'success',
        data: {
          books: bookLists,
        },
      })
      .code(200);
};

const _listBookHelper = (books) => {
  return books.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));
};

const getBookByIdHandler = (req, h) => {
  const {bookId} = req.params;
  const book = books.filter((data) => data.id === bookId)[0];
  if (!book) {
    return h
        .response({status: 'fail', message: 'Buku tidak ditemukan'})
        .code(404);
  }
  return h.response({
    status: 'success',
    data: {
      book,
    },
  });
};

const editBookByIdHandler = (req, h) => {
  const {bookId} = req.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = req.payload;
  const indexBook = books.findIndex((data) => data.id === bookId);

  if (indexBook === -1) {
    return h
        .response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        })
        .code(404);
  }

  if (!name) {
    return h
        .response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        })
        .code(400);
  }

  if (readPage > pageCount) {
    return h
        .response({
          status: 'fail',
          message:
          'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        })
        .code(400);
  }

  books[indexBook] = {
    ...books[indexBook],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  };

  return {
    status: 'success',
    message: 'Buku berhasil diperbarui',
  };
};

const deleteBookByIdHandler = (req, h) => {
  const {bookId} = req.params;
  const indexBook = books.findIndex((data) => data.id === bookId);
  if (indexBook === -1) {
    return h
        .response({
          status: 'fail',
          message: 'Buku gagal dihapus. Id tidak ditemukan',
        })
        .code(404);
  }
  books.splice(indexBook, 1);
  return {
    status: 'success',
    message: 'Buku berhasil dihapus',
  };
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
