import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const bookingsPath = path.join(process.cwd(), 'data', 'bookings.json')

export async function GET() {
  try {
    const data = fs.readFileSync(bookingsPath, 'utf8')
    const bookings = JSON.parse(data)
    return NextResponse.json(bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function POST(request) {
  try {
    const booking = await request.json()
    
    const data = fs.readFileSync(bookingsPath, 'utf8')
    const bookings = JSON.parse(data)
    
    const newBooking = {
      id: Date.now(),
      ...booking,
      created_at: new Date().toISOString()
    }
    
    bookings.push(newBooking)
    fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2))
    
    return NextResponse.json({ success: true, id: newBooking.id })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
