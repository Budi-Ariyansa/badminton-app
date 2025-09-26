import { NextRequest, NextResponse } from 'next/server'
const { getDb, initDatabase } = require('../../../lib/database')

export async function GET() {
  try {
    initDatabase()
    const db = getDb()
    
    return new Promise((resolve) => {
      db.all("SELECT name FROM banks", (err, rows) => {
        db.close()
        if (err) {
          console.error('GET Banks Error:', err)
          resolve(NextResponse.json([], { status: 200 }))
        } else {
          const bankNames = rows.map((row: any) => row.name)
          resolve(NextResponse.json(bankNames))
        }
      })
    })
  } catch (error) {
    console.error('GET Banks Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const banks = await request.json()
    initDatabase()
    const db = getDb()
    
    return new Promise((resolve) => {
      db.serialize(() => {
        db.run("DELETE FROM banks")
        
        const stmt = db.prepare("INSERT INTO banks (name) VALUES (?)")
        banks.forEach((bank: string) => {
          stmt.run([bank])
        })
        stmt.finalize()
        
        db.close()
        resolve(NextResponse.json({ success: true }))
      })
    })
  } catch (error: any) {
    console.error('POST Banks Error:', error)
    return NextResponse.json({ 
      error: 'Failed to save banks', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
