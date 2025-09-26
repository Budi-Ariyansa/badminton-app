import { NextRequest, NextResponse } from 'next/server'
const { getDb, initDatabase } = require('../../../lib/database')

export async function GET() {
  try {
    initDatabase()
    const db = getDb()
    
    return new Promise((resolve) => {
      db.all("SELECT * FROM courts", (err, rows) => {
        db.close()
        if (err) {
          console.error('GET Courts Error:', err)
          resolve(NextResponse.json([], { status: 200 }))
        } else {
          resolve(NextResponse.json(rows))
        }
      })
    })
  } catch (error) {
    console.error('GET Courts Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const courts = await request.json()
    initDatabase()
    const db = getDb()
    
    return new Promise((resolve) => {
      db.serialize(() => {
        db.run("DELETE FROM courts")
        
        const stmt = db.prepare("INSERT INTO courts (name, location, pricePerHour) VALUES (?, ?, ?)")
        courts.forEach((court: any) => {
          stmt.run([court.name, court.location, court.pricePerHour])
        })
        stmt.finalize()
        
        db.close()
        resolve(NextResponse.json({ success: true }))
      })
    })
  } catch (error: any) {
    console.error('POST Courts Error:', error)
    return NextResponse.json({ 
      error: 'Failed to save courts', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
