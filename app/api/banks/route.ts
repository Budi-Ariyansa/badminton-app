import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'banks.json')
    const data = readFileSync(filePath, 'utf8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    console.error('GET Banks Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const banks = await request.json()
    const filePath = join(process.cwd(), 'data', 'banks.json')
    writeFileSync(filePath, JSON.stringify(banks, null, 2))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('POST Banks Error:', error)
    return NextResponse.json({ 
      error: 'Failed to save banks', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
