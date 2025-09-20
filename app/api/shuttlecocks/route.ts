import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'shuttlecocks.json')
    const data = readFileSync(filePath, 'utf8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const shuttlecocks = await request.json()
    const filePath = join(process.cwd(), 'data', 'shuttlecocks.json')
    writeFileSync(filePath, JSON.stringify(shuttlecocks, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save shuttlecocks' }, { status: 500 })
  }
}
