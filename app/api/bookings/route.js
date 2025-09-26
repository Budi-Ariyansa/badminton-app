import { NextResponse } from 'next/server'
const { pool, initDatabase } = require('../../../lib/database')

export async function GET() {
  try {
    await initDatabase()
    const result = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('GET Bookings Error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request) {
  try {
    const booking = await request.json()
    await initDatabase()
    
    const result = await pool.query(`INSERT INTO bookings 
      (date, courtName, courtLocation, courtPrice, shuttlecockName, shuttlecockPrice, 
       shuttlecockCount, duration, playerCount, totalCost, costPerPerson, 
       bankName, bankAccountName, bankAccountNumber) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`, [
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
    ])
    
    return NextResponse.json({ success: true, id: result.rows[0].id })
  } catch (error) {
    console.error('POST Bookings Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
