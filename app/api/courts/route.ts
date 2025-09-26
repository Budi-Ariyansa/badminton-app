import { NextRequest, NextResponse } from 'next/server'
const { pool, initDatabase } = require('../../../lib/database')

export async function GET(): Promise<NextResponse> {
  try {
    await initDatabase()
    const result = await pool.query("SELECT * FROM courts")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('GET Courts Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const courts = await request.json()
    await initDatabase()
    
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query("DELETE FROM courts")
      
      for (const court of courts) {
        await client.query("INSERT INTO courts (name, location, priceperhour) VALUES ($1, $2, $3)", 
          [court.name, court.location, court.priceperhour || court.pricePerHour || 0])
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
    console.error('POST Courts Error:', error)
    return NextResponse.json({ 
      error: 'Failed to save courts', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
