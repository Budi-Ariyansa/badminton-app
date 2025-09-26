import { NextResponse } from 'next/server'
const { getDb, initDatabase } = require('../../../lib/database')

export async function GET() {
  try {
    initDatabase()
    const db = getDb()
    
    return new Promise((resolve) => {
      db.all("SELECT * FROM bookings ORDER BY created_at DESC", (err, rows) => {
        db.close()
        if (err) {
          console.error('GET Bookings Error:', err)
          resolve(NextResponse.json([]))
        } else {
          resolve(NextResponse.json(rows))
        }
      })
    })
  } catch (error) {
    console.error('GET Bookings Error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request) {
  try {
    const booking = await request.json()
    initDatabase()
    const db = getDb()
    
    return new Promise((resolve) => {
      const stmt = db.prepare(`INSERT INTO bookings 
        (date, courtName, courtLocation, courtPrice, shuttlecockName, shuttlecockPrice, 
         shuttlecockCount, duration, playerCount, totalCost, costPerPerson, 
         bankName, bankAccountName, bankAccountNumber) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      
      stmt.run([
        booking.date,
        booking.courtName,
        booking.courtLocation,
        booking.courtPrice,
        booking.shuttlecockName,
        booking.shuttlecockPrice,
        booking.shuttlecockCount,
        booking.duration,
        booking.playerCount,
        booking.totalCost,
        booking.costPerPerson,
        booking.bankName,
        booking.bankAccountName,
        booking.bankAccountNumber
      ], function(err) {
        stmt.finalize()
        db.close()
        
        if (err) {
          console.error('POST Bookings Error:', err)
          resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }))
        } else {
          resolve(NextResponse.json({ success: true, id: this.lastID }))
        }
      })
    })
  } catch (error) {
    console.error('POST Bookings Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
