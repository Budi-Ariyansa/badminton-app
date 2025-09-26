const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(process.cwd(), 'data', 'badminton.db')

function getDb() {
  return new sqlite3.Database(dbPath)
}

function initDatabase() {
  const db = getDb()
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Courts table
      db.run(`CREATE TABLE IF NOT EXISTS courts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        location TEXT NOT NULL,
        pricePerHour INTEGER NOT NULL
      )`)

      // Shuttlecocks table
      db.run(`CREATE TABLE IF NOT EXISTS shuttlecocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        pricePerPiece INTEGER NOT NULL
      )`)

      // Banks table
      db.run(`CREATE TABLE IF NOT EXISTS banks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )`)

      // Bookings table
      db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        courtName TEXT NOT NULL,
        courtLocation TEXT NOT NULL,
        courtPrice INTEGER NOT NULL,
        shuttlecockName TEXT NOT NULL,
        shuttlecockPrice INTEGER NOT NULL,
        shuttlecockCount INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        playerCount INTEGER NOT NULL,
        totalCost INTEGER NOT NULL,
        costPerPerson INTEGER NOT NULL,
        bankName TEXT,
        bankAccountName TEXT,
        bankAccountNumber TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      // Insert default data
      db.get("SELECT COUNT(*) as count FROM courts", (err, row) => {
        if (!err && row.count === 0) {
          const courts = [
            { name: "Gor H.Wahyu", location: "Gempol / Kunciran Induk", pricePerHour: 45000 },
            { name: "Gor Pusdik Lantas Smash", location: "Paku Jaya", pricePerHour: 75000 },
            { name: "Gor Family club Graha Raya (Sport Hall)", location: "Graha Raya", pricePerHour: 90000 }
          ]
          courts.forEach(court => {
            db.run("INSERT INTO courts (name, location, pricePerHour) VALUES (?, ?, ?)", 
              [court.name, court.location, court.pricePerHour])
          })
        }
      })

      db.get("SELECT COUNT(*) as count FROM shuttlecocks", (err, row) => {
        if (!err && row.count === 0) {
          const shuttlecocks = [
            { name: "Gong 2000", pricePerPiece: 10000 },
            { name: "JP Gold", pricePerPiece: 12000 },
            { name: "Alpha", pricePerPiece: 16000 }
          ]
          shuttlecocks.forEach(shuttlecock => {
            db.run("INSERT INTO shuttlecocks (name, pricePerPiece) VALUES (?, ?)", 
              [shuttlecock.name, shuttlecock.pricePerPiece])
          })
        }
      })

      db.get("SELECT COUNT(*) as count FROM banks", (err, row) => {
        if (!err && row.count === 0) {
          const banks = ["BCA", "Mandiri", "BRI", "BNI", "Bank Jago", "Aladin", "Blu By BCA", "Danamon", "Permata"]
          banks.forEach(bank => {
            db.run("INSERT INTO banks (name) VALUES (?)", [bank])
          })
        }
        
        // Close database after all operations
        db.close((err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    })
  })
}

module.exports = { getDb, initDatabase }
