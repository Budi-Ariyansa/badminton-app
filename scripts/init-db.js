const { initDatabase } = require('../lib/database')

async function main() {
  try {
    console.log('Initializing PostgreSQL database...')
    await initDatabase()
    console.log('Database initialized successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

main()
