import { NextRequest, NextResponse } from 'next/server'
const { pool, initDatabase } = require('../../../lib/database')

export async function GET(): Promise<NextResponse> {
  try {
    await initDatabase()
    const result = await pool.query("SELECT * FROM shuttlecocks")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('GET Shuttlecocks Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const shuttlecocks = await request.json()
    await initDatabase()
    
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query("DELETE FROM shuttlecocks")
      
      for (const shuttlecock of shuttlecocks) {
        await client.query("INSERT INTO shuttlecocks (name, priceperpiece) VALUES ($1, $2)", 
          [shuttlecock.name, shuttlecock.priceperpiece || shuttlecock.pricePerPiece || 0])
      }
      
      await client.query('COMMIT')
      return NextResponse.json({ success: true })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('POST Shuttlecocks Error:', error)
    return NextResponse.json({ 
      error: 'Failed to save shuttlecocks', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
