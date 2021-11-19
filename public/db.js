const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
  target.result.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
  db = target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  // TODO: this function should save a transaction object to indexedDB so that
  // it can be synced with the database when the user goes back online.
  const transaction = db.transaction(['pending'], 'readwrite');
  const pending = transaction.objectStore('pending');

  console.log(record);

  pending.add(record);
}

function checkDatabase() {
  // TODO: this function should check for any saved transactions and post them
  // all to the database. Delete the transactions from IndexedDB if the post
  // request is successful.
  const transaction = db.transaction(['pending'], 'readwrite');
  const pending = transaction.objectStore('pending');

  const getAll = pending.getAll();
  getAll.onsuccess = async () => {
    if (getAll.result.length === 0) {
      // no items to post to backend. end function.
      return;
    }
    // post the transaction from indexedDB to the database
    const response = await fetch("/api/transaction/bulk", {
      method: "POST",
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    // result contains the newly added items;
    const dbTransactions = await response.json();
    if (dbTransactions.length > 0) {
      const transaction = db.transaction(['pending'], 'readwrite');
      const pending = transaction.objectStore('pending');
      
      pending.clear();
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);