import * as fb from "./fbFunctions";

/**
 * showAll, allPages [*]
 * getTitle, titlePages [*]
 * getCategory, categoryPages [*]
 * getAuthor, authorPages [*]
 * showAvailable, availablePages [*]
 */

//21
export function showBorrowedBooks(db, req, res) {
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  let queryString = `SELECT title, author, img FROM book WHERE uid = '${id}'`;

  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
    }
    if (!rows.length) {
      return res.json({ fulfillmentText: `You didn't borrow anything!️` });
    } else {
      let borrowedBooks = [];
      // list of cards with book img, author, title
      for (let i = 0; i < rows.length; i++) {
        borrowedBooks.push(
          sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img)
        );
      }
      fb.pushMessage(id, `Here are your borrowed books!`);
      return res.json({ fulfillmentMessages: borrowedBooks });
    }
  });
}

//27
export function showAllBooks(db, req, res) {
  const queryString = "SELECT title, author, category FROM book";

  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }

    if (!rows.length) {
      return res.json({ fulfillmentText: "There are no books in the db!" });
    }
    let allPages = [];
    let limit = getNumOfPages(rows.length);

    //list of quick replies
    for (let i = 0; i < limit; i++) {
      let pageNum = `${i + 1} : All `;
      allPages.push(pageNum);
    }

    return res.json({
      fulfillmentMessages: [
        fb.quickReplies(
          `There are ${rows.length} books. \n So there are ${Math.ceil(
            rows.length / 10
          )} pages \n Type: 1 : All to get the first 10 books! Or click one of these!`,
          allPages
        )
      ]
    });
  });
}

//36
export function allPages(db, req, res) {
  const queryString =
    "SELECT title, author, category, img FROM book ORDER BY title ASC";
  let page = req.body.queryResult.parameters.page;
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }
    if (!rows.length) {
      return res.json({ fulfillmentText: "There are no books in the db!" });
    }
    const startingPage = (page - 1) * 10;
    let pageNum = getLastPage(page, rows.length);
    let msg = `Here are the books from ${startingPage} to ${pageNum}:`;
    let allBooks = [];
    // list of cards with book img, author, title
    for (let i = startingPage; i < pageNum; i++) {
      allBooks.push(
        sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img)
      );
    }
    setTimeout(() => {
      fb.pushQuickReplies(
        id,
        msg,
        getQuickReplyPages("All", page, rows.length, "")
      );
    }, 3000);
    return res.json({ fulfillmentMessages: allBooks });
  });
}

//20
export function showAllCategories(db, req, res) {
  const queryString = "SELECT DISTINCT category FROM book";

  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }

    if (!rows.length) {
      return res.json({ fulfillmentText: "There are no books in the db!" });
    } else {
      let categories = "Here are the categories: \n";
      for (let i = 0; i < rows.length; i++) {
        categories += rows[i].category;
      }
      return res.json({ fulfillmentText: categories });
    }
  });
}

//25
export function showUnavailableBooks(db, req, res) {
  const queryString =
    "SELECT title, author, category FROM book where uid is not null";

  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }
    if (!rows.length) {
      return res.json({ fulfillmentText: "All are available!" });
    } else {
      let unavailableBooks = "Here are the unavailable books:";
      for (let i = 0; i < rows.length; i++) {
        unavailableBooks +=
          "\n\n" +
          rows[i].title +
          "\nAuthor: " +
          rows[i].author +
          "\nCategory: " +
          rows[i].category;
      }
      return res.json({ fulfillmentText: unavailableBooks });
    }
  });
}

//26
export function showAvailableBooks(db, req, res) {
  const queryString =
    "SELECT title, author, category FROM book where uid is null";

  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }
    let availablePages = [];
    let limit = getNumOfPages(rows.length);
    // list of quick replies
    for (let i = 0; i < limit; i++) {
      let pageNum = `${i + 1} : Available `;
      availablePages.push(pageNum);
    }
    return res.json({
      fulfillmentMessages: [
        fb.quickReplies(
          `There are ${rows.length} books. \nThere are ${Math.ceil(
            rows.length / 10
          )} pages  \n Type 1 : Available to get the first 10 books! Or click one of these!`,
          availablePages
        )
      ]
    });
  });
}

//34
export function availablePages(db, req, res) {
  const queryString =
    "SELECT title, author, img FROM book where uid is null ORDER by title ASC";
  let page = req.body.queryResult.parameters.page;
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;

  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }
    if (!rows.length) {
      return res.json({ fulfillmentText: "There are no books in the db!" });
    }
    const startingPage = (page - 1) * 10;
    let lastPage = getLastPage(page, rows.length);
    let msg = `Here are the available books from ${startingPage} to ${lastPage}:`;
    let availableBooks = [];
    // list of cards with book img, author, title
    for (let i = startingPage; i < lastPage; i++) {
      availableBooks.push(
        sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img)
      );
    }
    // makes sure cards show up before quick reply
    setTimeout(() => {
      fb.pushQuickReplies(
        id,
        msg,
        getQuickReplyPages("Available", page, rows.length, "")
      );
    }, 3000);
    return res.json({ fulfillmentMessages: availableBooks });
  });
}

//30
export function getBookAuthor(db, req, res) {
  const author = req.body.queryResult.parameters.author;
  const queryString =
    "SELECT title, author, category FROM book WHERE author like?";
  db.query(queryString, "%" + author + "%", (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }
    if (!rows.length) {
      return res.json({ fulfillmentText: `${author} has no books!` });
    } else {
      let authorPages = [];
      let limit = getNumOfPages(rows.length);
      //list of quick replies
      for (let i = 0; i < limit; i++) {
        let pageNum = `A ${i + 1} : ${author} `;
        authorPages.push(pageNum);
      }
      return res.json({
        fulfillmentMessages: [
          fb.quickReplies(
            `There are ${rows.length} books. \n So there are ${Math.ceil(
              rows.length / 10
            )} pages \n Type: A 1 : ${author} to get the first 10 books! Or click one of these!`,
            authorPages
          )
        ]
      });
    }
  });
}

//35
export function authorPages(db, req, res) {
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  let page = req.body.queryResult.parameters.page;
  const author = req.body.queryResult.parameters.author;
  const queryString = "SELECT title, author, img FROM book WHERE author like?";
  db.query(queryString, "%" + author + "%", (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }
    if (!rows.length) {
      return res.json({ fulfillmentText: "There are no books in the db!" });
    }
    const startingPage = (page - 1) * 10;
    let lastPage = getLastPage(page, rows.length);
    let msg = `Here are books by ${author}: from ${startingPage} to ${lastPage}:`;
    let quickReplies = [];
    // list of cards with book img, author, title
    for (let i = 1; i < 6; i++) {
      quickReplies.push(`A ${page + i} : ${author}`);
    }
    let authorBooks = [];
    for (let i = startingPage; i < lastPage; i++) {
      authorBooks.push(
        sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img)
      );
    }
    let maxPages = Math.ceil(rows.length / 10);
    checkMaxPages(
      maxPages,
      id,
      msg,
      getQuickReplyPages(author, page, rows.length, "A")
    );
    return res.json({ fulfillmentMessages: authorBooks });
  });
}

//37
export function getBookTitle(db, req, res) {
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  const title = req.body.queryResult.parameters.title;
  const queryString =
    "SELECT title, author, category, img FROM book WHERE title like ?";
  db.query(queryString, "%" + title + "%", (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error in finding book ${title}!` });
    }
    if (!rows.length) {
      return res.json({ fulfillmentText: `We don't have anything ${title}!` });
    } else {
      //checks if instance is only 1 to enable quick reply of borrowing of book
      if (rows.length == 1) {
        sliceTitleAuthorImg(rows[0].title, rows[0].author, rows[0].img);
        let borrow = `Borrow ${title}`;
        return allowQuickReplyBorrow(
          borrow,
          rows[0].title,
          rows[0].author,
          rows[0].img
        );
      } else {
        let titlePages = [];
        let limit = getNumOfPages(rows.length);
        // list of quick replies
        for (let i = 0; i < limit; i++) {
          let pageNum = `T ${i + 1} : ${title} `;
          titlePages.push(pageNum);
        }
        let msg = `There are ${
          rows.length
        } books with the title ${title}. \n So there are ${Math.ceil(
          rows.length / 10
        )} pages \n Type: T 1 : ${title} to get the first 10 books! Or click one of these!`;
        return res.json({
          fulfillmentMessages: [fb.quickReplies(msg, titlePages)]
        });
      }
    }
  });
}

//30
export function titlePages(db, req, res) {
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  let page = req.body.queryResult.parameters.page;
  const ptitle = req.body.queryResult.parameters.title;
  const queryString = "SELECT title, author, img FROM book WHERE title like ?";
  db.query(queryString, "%" + ptitle + "%", (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }
    if (!rows.length) {
      return res.json({ fulfillmentText: "There are no books in the db!" });
    }
    const startingPage = (page - 1) * 10;
    let pageNum = getLastPage(page, rows.length);
    let msg = `Here are books with title: ${ptitle} from ${startingPage} to ${pageNum}:`;
    let titleBooks = [];
    // list of cards with book img, author, title
    for (let i = startingPage; i < pageNum; i++) {
      titleBooks.push(
        sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img)
      );
    }
    //check max pages, makes sure that returns appropriate amount of quick replies
    checkMaxPages(
      rows.length / 10,
      id,
      msg,
      getQuickReplyPages(ptitle, page, rows.length, "T")
    );
    return res.json({ fulfillmentMessages: titleBooks });
  });
}

//32
export function getBookCategory(db, req, res) {
  const category = req.body.queryResult.parameters.category;
  const queryString =
    "SELECT title, author, category, img FROM book WHERE category like?";
  db.query(queryString, "%" + category + "%", (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }
    if (!rows.length) {
      return res.json({
        fulfillmentText: `We don't have anything in ${category}! :'(`
      });
    } else {
      let pages = [];
      let limit = getNumOfPages(rows.length);
      // list of quick replies
      for (let i = 0; i < limit; i++) {
        let pageNum = `C ${i + 1} : ${category} `;
        pages.push(pageNum);
      }
      return res.json({
        fulfillmentMessages: [
          fb.quickReplies(
            `There are ${rows.length} books. \n So there are ${Math.ceil(
              rows.length / 10
            )} pages \n Type: 1 : All to get the first 10 books! Or click one of these!`,
            pages
          )
        ]
      });
    }
  });
}

//37
export function categoryPages(db, req, res) {
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  let page = req.body.queryResult.parameters.page;
  const category = req.body.queryResult.parameters.category;
  const queryString =
    "SELECT title, author, category, img FROM book WHERE category like?";
  db.query(queryString, "%" + category + "%", (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ fulfillmentText: `Error!` });
    }
    if (!rows.length) {
      return res.json({ fulfillmentText: "There are no books in the db!" });
    }
    const startingPage = (page - 1) * 10;
    let pageNum = getLastPage(page, rows.length);
    let msg = `Here are ${category} books: from ${startingPage} to ${pageNum}:`;
    let categoryBooks = [];
    // list of cards with book img, author, title
    for (let i = startingPage; i < pageNum; i++) {
      categoryBooks.push(
        sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img)
      );
    }
    //check max pages, makes sure that returns appropriate amount of quick replies
    checkMaxPages(
      rows.length / 10,
      id,
      msg,
      getQuickReplyPages(category, page, rows.length, "C")
    );
    return res.json({ fulfillmentMessages: categoryBooks });
  });
}

// returns appropriate fbCard with quotations sliced
export function sliceTitleAuthorImg(title, author, img) {
  return fb.fbCard(title.slice(1, -1), author.slice(1, -1), img.slice(1, -1));
}

//makes sure that the last page has the exact cards
export function getLastPage(page, length) {
  let pageNum = 0;
  if (page === Math.floor(length / 10) + 1) {
    const excess = length % 10;
    pageNum = (page - 1) * 10 + excess;
  } else {
    pageNum = page * 10;
  }
  return pageNum;
}

export function getQuickReplyPages(pageName, page, length, keyword) {
  let lastPage = Math.ceil(length / 10);
  let qr = [];
  if (page === lastPage) {
    // if we are on page that's the lastPage, quick replies shows pages back
    for (let i = 1; i < 6; i++) {
      qr.push(`${keyword} ${page - i} : ${pageName} `);
    }
  } else if (page > lastPage - 5) {
    // ex if lastPage is 25 and im on page 23, it shouldn't show 23+5 pages, should only show 24 25 so it will only show 2 more quick reply pages
    for (let i = 1; i < lastPage - (page - 1); i++) {
      qr.push(`${keyword} ${page + i} : ${pageName} `);
    }
  } else {
    for (let i = 1; i < 6; i++) {
      qr.push(`${keyword} ${page + i} : ${pageName} `);
    }
  }
  return qr;
}

// makes sure if more than 10 pages, limit will be 10
export function getNumOfPages(length) {
  let limit = 0;
  if (length / 10 > 10) {
    limit = 10;
  } else {
    limit = Math.ceil(length / 10);
  }
  return limit;
}

export function checkMaxPages(maxPages, id, msg, quickReplyPages) {
  if (Math.ceil(maxPages) > 1) {
    if (Math.ceil(maxPages) < 5) {
      quickReplies = quickReplies.slice(0, Math.ceil(maxPages));
    }
    setTimeout(() => {
      fb.pushQuickReplies(id, msg, quickReplyPages);
    }, 3000);
  }
}

//checks if possible to quick reply borrow
export function allowQuickReplyBorrow(msg, title, author, img) {
  if (msg.length > 20) {
    return res.json({
      fulfillmentText: `Would you like to borrow that book? Type: ${title}`
    });
  } else {
    setTimeout(() => {
      fb.pushQuickReplies(
        id,
        `Would you like to borrow that book? Click this!`,
        [msg]
      );
    }, 3000);
    return res.json({
      fulfillmentMessages: [sliceTitleAuthorImg(title, author, img)]
    });
  }
}
