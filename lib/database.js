const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://default:mIJWBha6r1SV@ep-polished-water-07743317-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require"
})

async function initDatabase() {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Courts table
    await client.query(`CREATE TABLE IF NOT EXISTS courts (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      location TEXT NOT NULL,
      pricePerHour INTEGER NOT NULL
    )`)

    // Shuttlecocks table
    await client.query(`CREATE TABLE IF NOT EXISTS shuttlecocks (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      pricePerPiece INTEGER NOT NULL
    )`)

    // Banks table
    await client.query(`CREATE TABLE IF NOT EXISTS banks (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    )`)

    // Bookings table
    await client.query(`CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

    // Insert default data
    const courtsCount = await client.query("SELECT COUNT(*) FROM courts")
    if (courtsCount.rows[0].count == 0) {
      const courts = [
        { name: "Gor H.Wahyu", location: "Gempol / Kunciran Induk", pricePerHour: 45000 },
        { name: "Gor Pusdik Lantas Smash", location: "Paku Jaya", pricePerHour: 75000 },
        { name: "Gor Family club Graha Raya (Sport Hall)", location: "Graha Raya", pricePerHour: 90000 }
      ]
      for (const court of courts) {
        await client.query("INSERT INTO courts (name, location, pricePerHour) VALUES ($1, $2, $3)", 
          [court.name, court.location, court.pricePerHour])
      }
    }

    const shuttlecocksCount = await client.query("SELECT COUNT(*) FROM shuttlecocks")
    if (shuttlecocksCount.rows[0].count == 0) {
      const shuttlecocks = [
        { name: "Gong 2000", pricePerPiece: 10000 },
        { name: "JP Gold", pricePerPiece: 12000 },
        { name: "Alpha", pricePerPiece: 16000 }
      ]
      for (const shuttlecock of shuttlecocks) {
        await client.query("INSERT INTO shuttlecocks (name, pricePerPiece) VALUES ($1, $2)", 
          [shuttlecock.name, shuttlecock.pricePerPiece])
      }
    }

    const banksCount = await client.query("SELECT COUNT(*) FROM banks")
    if (banksCount.rows[0].count == 0) {
      const banks = ["BCA", "Mandiri", "BRI", "BNI", "Bank Jago", "Aladin", "Blu By BCA", "Danamon", "Permata"]
      for (const bank of banks) {
        await client.query("INSERT INTO banks (name) VALUES ($1)", [bank])
      }
    }
    
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = { pool, initDatabase }
