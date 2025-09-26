import { NextRequest, NextResponse } from 'next/server'
const { getDb, initDatabase } = require('../../../lib/database')

export async function GET(): Promise<NextResponse> {
  try {
    initDatabase()
    const db = getDb()
    
    return new Promise((resolve) => {
      db.all("SELECT * FROM shuttlecocks", (err: any, rows: any) => {
        db.close()
        if (err) {
          console.error('GET Shuttlecocks Error:', err)
          resolve(NextResponse.json([], { status: 200 }))
        } else {
          resolve(NextResponse.json(rows))
        }
      })
    })
  } catch (error) {
    console.error('GET Shuttlecocks Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const shuttlecocks = await request.json()
    initDatabase()
    const db = getDb()
    
    return new Promise((resolve) => {
      db.serialize(() => {
        db.run("DELETE FROM shuttlecocks")
        
        const stmt = db.prepare("INSERT INTO shuttlecocks (name, pricePerPiece) VALUES (?, ?)")
        shuttlecocks.forEach((shuttlecock: any) => {
          stmt.run([shuttlecock.name, shuttlecock.pricePerPiece])
        })
        stmt.finalize()
        
        db.close()
        resolve(NextResponse.json({ success: true }))
      })
    })
  } catch (error: any) {
    console.error('POST Shuttlecocks Error:', error)
    return NextResponse.json({ 
      error: 'Failed to save shuttlecocks', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
