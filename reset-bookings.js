const { pool } = require('./lib/database');

async function resetBookings() {
  try {
    await pool.query('DELETE FROM bookings');
    console.log('All booking records deleted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetBookings();
