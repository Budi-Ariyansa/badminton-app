import { NextRequest, NextResponse } from 'next/server'
const { pool, initDatabase } = require('../../../lib/database')

export async function GET(): Promise<NextResponse> {
  try {
    await initDatabase()
    const result = await pool.query("SELECT name FROM banks")
    const bankNames = result.rows.map((row: any) => row.name)
    return NextResponse.json(bankNames)
  } catch (error) {
    console.error('GET Banks Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const banks = await request.json()
    await initDatabase()
    
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query("DELETE FROM banks")
      
      for (const bank of banks) {
        await client.query("INSERT INTO banks (name) VALUES ($1)", [bank])
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
    console.error('POST Banks Error:', error)
    return NextResponse.json({ 
      error: 'Failed to save banks', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
