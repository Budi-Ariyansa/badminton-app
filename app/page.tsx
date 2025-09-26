'use client'

import { useState, useEffect } from 'react'
import { Download, Share2, History } from 'lucide-react'
import BookingHistory from './components/BookingHistory'
import Toast from './components/Toast'
import Loading from './components/Loading'

interface Court {
  name: string
  location: string
  priceperhour: number
}

interface Shuttlecock {
  name: string
  priceperpiece: number
}

interface BankAccount {
  accountName: string
  accountNumber: string
  bankName: string
}

export default function BadmintonCalculator() {
  const [courts, setCourts] = useState<Court[]>([])
  const [shuttlecocks, setShuttlecocks] = useState<Shuttlecock[]>([])
  const [bankOptions, setBankOptions] = useState<string[]>([])
  const [playDate, setPlayDate] = useState('')
  const [duration, setDuration] = useState(1)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [courtPrice, setCourtPrice] = useState(0)
  const [selectedShuttlecock, setSelectedShuttlecock] = useState<Shuttlecock | null>(null)
  const [shuttlecockPrice, setShuttlecockPrice] = useState(0)
  const [shuttlecockCount, setShuttlecockCount] = useState(1)
  const [playerCount, setPlayerCount] = useState(1)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [newAccount, setNewAccount] = useState<BankAccount>({
    accountName: '',
    accountNumber: '',
    bankName: ''
  })
  const [showBookingHistory, setShowBookingHistory] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', isVisible: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [courtsRes, shuttlecocksRes, banksRes] = await Promise.all([
          fetch('/api/courts').catch(() => ({ json: () => [] })),
          fetch('/api/shuttlecocks').catch(() => ({ json: () => [] })),
          fetch('/api/banks').catch(() => ({ json: () => [] }))
        ])

        const [courtsData, shuttlecocksData, banksData] = await Promise.all([
          courtsRes.json(),
          shuttlecocksRes.json(),
          banksRes.json()
        ])

        setCourts((courtsData || []).filter((court: any) => court?.name))
        setShuttlecocks((shuttlecocksData || []).filter((shuttlecock: any) => shuttlecock?.name))
        setBankOptions(Array.from(new Set((banksData || []).filter(Boolean))))
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAllData()
  }, [])

  const formatDateToIndonesian = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${dayName}, ${day} ${month} ${year}`
  }

  const addBankAccount = () => {
    if (newAccount.accountName && newAccount.accountNumber && newAccount.bankName) {
      setBankAccounts([...bankAccounts, newAccount])
      setNewAccount({ accountName: '', accountNumber: '', bankName: '' })
    }
  }

  const calculateTotal = () => {
    if (!selectedCourt || !selectedShuttlecock || courtPrice === 0 || shuttlecockPrice === 0) return 0
    const courtCost = courtPrice * duration
    const shuttlecockCost = shuttlecockPrice * shuttlecockCount
    return (courtCost + shuttlecockCost) / playerCount
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true })
  }

  const saveBooking = async () => {
    if (!selectedCourt || !selectedShuttlecock || !playDate) {
      showToast('Mohon lengkapi semua data terlebih dahulu!', 'error')
      return
    }

    const totalCost = (courtPrice * duration) + (shuttlecockPrice * shuttlecockCount)
    const costPerPerson = totalCost / playerCount

    const booking = {
      date: playDate,
      courtName: selectedCourt.name,
      courtLocation: selectedCourt.location,
      courtPrice: courtPrice,
      shuttlecockName: selectedShuttlecock.name,
      shuttlecockPrice: shuttlecockPrice,
      shuttlecockCount: shuttlecockCount,
      duration: duration,
      playerCount: playerCount,
      totalCost: totalCost,
      costPerPerson: costPerPerson,
      bankName: selectedAccount?.bankName || null,
      bankAccountName: selectedAccount?.accountName || null,
      bankAccountNumber: selectedAccount?.accountNumber || null
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        showToast('Booking berhasil disimpan!', 'success')
      } else {
        showToast(result.error || 'Gagal menyimpan booking', 'error')
      }
    } catch (error) {
      console.error('Failed to save booking:', error)
      showToast('Terjadi error saat menyimpan booking', 'error')
    }
  }

  const generateInvoice = () => {
    const total = calculateTotal()
    return {
      date: playDate,
      duration: duration || 1,
      court: selectedCourt,
      courtPrice: courtPrice || 0,
      shuttlecock: selectedShuttlecock,
      shuttlecockPrice: shuttlecockPrice || 0,
      shuttlecockCount: shuttlecockCount || 1,
      playerCount: playerCount || 1,
      account: selectedAccount,
      bankAccounts,
      costPerPerson: total || 0,
      totalCost: selectedCourt && selectedShuttlecock ? 
        ((courtPrice || 0) * (duration || 1)) + ((shuttlecockPrice || 0) * (shuttlecockCount || 1)) : 0
    }
  }

  const exportReceipt = () => {
    const invoice = generateInvoice()
    
    // Calculate dynamic height more accurately
    const baseHeight = 400
    const bankAccountsHeight = invoice.bankAccounts ? invoice.bankAccounts.length * 100 : 0
    const totalHeight = baseHeight + bankAccountsHeight + 300
    
    // Create canvas with thermal receipt proportions
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Thermal receipt size (narrower)
    canvas.width = 400
    canvas.height = totalHeight
    
    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Set default text properties
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    
    let y = 30
    const lineHeight = 20
    
    // Header
    ctx.font = 'bold 18px monospace'
    ctx.fillText('================================', canvas.width / 2, y)
    y += lineHeight
    ctx.fillText('🏸 STRUK BADMINTON 🏸', canvas.width / 2, y)
    y += lineHeight
    ctx.fillText('================================', canvas.width / 2, y)
    y += lineHeight * 2
    
    // Receipt details
    ctx.font = '12px monospace'
    ctx.textAlign = 'left'
    
    ctx.fillText(`Tanggal: ${formatDateToIndonesian(invoice.date)}`, 20, y)
    y += lineHeight
    ctx.fillText(`Durasi : ${invoice.duration} jam`, 20, y)
    y += lineHeight
    ctx.fillText(`Court  : ${invoice.court?.name}`, 20, y)
    y += lineHeight
    ctx.fillText(`Lokasi : ${invoice.court?.location}`, 20, y)
    y += lineHeight * 2
    
    // Separator
    ctx.textAlign = 'center'
    ctx.fillText('--------------------------------', canvas.width / 2, y)
    y += lineHeight
    ctx.fillText('RINCIAN BIAYA', canvas.width / 2, y)
    y += lineHeight
    ctx.fillText('--------------------------------', canvas.width / 2, y)
    y += lineHeight * 1.5
    
    // Cost breakdown
    ctx.textAlign = 'left'
    ctx.fillText(`Sewa Lapangan (${invoice.duration} jam)`, 20, y)
    y += lineHeight
    ctx.textAlign = 'right'
    ctx.fillText(`Rp ${((invoice.courtPrice || 0) * (invoice.duration || 1)).toLocaleString()}`, canvas.width - 20, y)
    y += lineHeight * 1.5
    
    ctx.textAlign = 'left'
    ctx.fillText(`Shuttlecock (${invoice.shuttlecockCount} biji)`, 20, y)
    y += lineHeight
    ctx.fillText(`${invoice.shuttlecock?.name}`, 20, y)
    y += lineHeight
    ctx.textAlign = 'right'
    ctx.fillText(`Rp ${((invoice.shuttlecockPrice || 0) * (invoice.shuttlecockCount || 1)).toLocaleString()}`, canvas.width - 20, y)
    y += lineHeight * 2
    
    // Total
    ctx.textAlign = 'center'
    ctx.fillText('--------------------------------', canvas.width / 2, y)
    y += lineHeight
    
    ctx.font = 'bold 14px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('TOTAL BIAYA:', 20, y)
    ctx.textAlign = 'right'
    ctx.fillText(`Rp ${(invoice.totalCost || 0).toLocaleString()}`, canvas.width - 20, y)
    y += lineHeight
    
    ctx.textAlign = 'left'
    ctx.fillText(`JUMLAH ORANG: ${invoice.playerCount}`, 20, y)
    y += lineHeight * 1.5
    
    // Cost per person highlight
    ctx.textAlign = 'center'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('================================', canvas.width / 2, y)
    y += lineHeight
    ctx.fillText(`BIAYA PER ORANG`, canvas.width / 2, y)
    y += lineHeight
    ctx.fillText(`Rp ${(invoice.costPerPerson || 0).toLocaleString()}`, canvas.width / 2, y)
    y += lineHeight
    ctx.fillText('================================', canvas.width / 2, y)
    y += lineHeight * 2
    
    // Bank accounts
    if (invoice.bankAccounts && invoice.bankAccounts.length > 0) {
      ctx.font = '12px monospace'
      ctx.fillText('TRANSFER KE:', canvas.width / 2, y)
      y += lineHeight
      ctx.fillText('--------------------------------', canvas.width / 2, y)
      y += lineHeight * 1.5
      
      invoice.bankAccounts.forEach((account, index) => {
        ctx.textAlign = 'left'
        ctx.font = 'bold 12px monospace'
        ctx.fillText(`${index + 1}. ${account.bankName}`, 20, y)
        y += lineHeight
        ctx.font = '12px monospace'
        ctx.fillText(`No. Rek: ${account.accountNumber}`, 20, y)
        y += lineHeight
        ctx.fillText(`A.n: ${account.accountName}`, 20, y)
        y += lineHeight * 2
      })
    }
    
    // Footer
    ctx.textAlign = 'center'
    ctx.font = '12px monospace'
    ctx.fillText('--------------------------------', canvas.width / 2, y)
    y += lineHeight
    ctx.fillText('Terima Kasih Telah Bermain!', canvas.width / 2, y)
    y += lineHeight
    ctx.fillText('Semoga Sehat Selalu 🏸', canvas.width / 2, y)
    y += lineHeight
    ctx.fillText('Sampai Jumpa Lagi!', canvas.width / 2, y)
    y += lineHeight
    ctx.fillText('================================', canvas.width / 2, y)
    
    // Download as PNG
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `struk-badminton-${playDate}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const shareToWhatsApp = () => {
    const invoice = generateInvoice()
    const message = `🏸 Struk Pembayaran Badminton 🏸

Halo teman-teman! 👋
Berikut adalah rincian biaya main bulutangkis hari ini:

Waktu & Lokasi 📍
Tanggal: ${formatDateToIndonesian(invoice.date)}
Durasi: ${invoice.duration} jam
Gor: ${invoice.court?.name}
Lokasi: ${invoice.court?.location}

Rincian Biaya 💰
Sewa Lapangan (${invoice.duration} jam): Rp ${(invoice.courtPrice || 0).toLocaleString()}
Shuttlecock (${invoice.shuttlecockCount} buah): Rp ${((invoice.shuttlecockPrice || 0) * (invoice.shuttlecockCount || 1)).toLocaleString()}
Total Biaya: Rp ${(invoice.totalCost || 0).toLocaleString()}

Jumlah Orang: ${invoice.playerCount} orang
Biaya per Orang: Rp ${Math.round(invoice.costPerPerson || 0).toLocaleString()} ✨

${invoice.bankAccounts && invoice.bankAccounts.length > 0 ? `Pembayaran 💳
Silakan transfer sesuai dengan biaya per orang ke salah satu rekening di bawah ini.

${invoice.bankAccounts.map(account => 
`${account.bankName}
No. Rek: ${account.accountNumber}
A.n: ${account.accountName}`
).join('\n\n')}` : ''}`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <Loading message="Memuat data kalkulator..." />
          </div>
        ) : (
        <>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
            <div className="text-white p-3 md:p-6 rounded-t-xl" style={{ 
              background: 'linear-gradient(135deg, #66B933 0%, #4a9025 100%)',
              boxShadow: '0 4px 20px rgba(102, 185, 51, 0.3)'
            }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                {/* Logo and Title */}
                <div className="flex items-center gap-3">
                  <img src="/images/logo.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                  <div>
                    <h1 className="text-base md:text-xl font-black tracking-wide">BADMINTON CALCULATOR</h1>
                    <p className="text-xs md:text-sm opacity-80 font-medium">Hitung biaya bermain per orang</p>
                  </div>
                </div>
                
                {/* Admin Button */}
                <div className="flex justify-end">
                  <a
                    href="/admin"
                    className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg text-xs md:text-sm font-bold hover:bg-opacity-30 transition-all duration-200"
                  >
                    <span className="text-xs md:text-sm">⚙️</span>
                    <span>ADMIN</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border rounded-lg shadow p-6 mb-6" style={{
            borderColor: '#66B933'
          }}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tanggal */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-gray-800 dark:text-gray-200">📅 Tanggal Bermain</label>
                <input
                  type="date"
                  value={playDate}
                  onChange={(e) => setPlayDate(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{ 
                    borderColor: '#66B933'
                  }}
                />
                {playDate && (
                  <div className="mt-1 text-sm text-gray-600 font-medium">
                    {formatDateToIndonesian(playDate)}
                  </div>
                )}
              </div>

              {/* Lapangan */}
              <div>
                <label className="block text-sm font-bold mb-2 text-black dark:text-white">🏟️ Pilih Lapangan</label>
                <select
                  value={selectedCourt?.name || ''}
                  onChange={(e) => {
                    const court = courts.find(c => c.name === e.target.value)
                    setSelectedCourt(court || null)
                    setCourtPrice(court?.priceperhour || 0)
                  }}
                  className="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  style={{ borderColor: '#66B933', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="">Pilih lapangan...</option>
                  {courts.map((court) => (
                    <option key={court.name} value={court.name}>
                      {court.name} - {court.location} (Rp {(court.priceperhour || 0).toLocaleString()}/jam)
                    </option>
                  ))}
                </select>
              </div>

              {/* Harga Lapangan */}
              <div>
                <label className="block text-sm font-bold mb-2 text-black dark:text-white">💰 Harga Lapangan per Jam</label>
                <input
                  type="text"
                  value={courtPrice ? `Rp ${courtPrice.toLocaleString()}` : 'Pilih lapangan dulu'}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                  style={{ borderColor: '#66B933' }}
                  placeholder="Rp 0"
                />
              </div>

              {/* Shuttlecock */}
              <div>
                <label className="block text-sm font-bold mb-2 text-black dark:text-white">🏸 Pilih Shuttlecock</label>
                <select
                  value={selectedShuttlecock?.name || ''}
                  onChange={(e) => {
                    const shuttlecock = shuttlecocks.find(s => s.name === e.target.value)
                    setSelectedShuttlecock(shuttlecock || null)
                    setShuttlecockPrice(shuttlecock?.priceperpiece || 0)
                  }}
                  className="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  style={{ borderColor: '#66B933', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="">Pilih shuttlecock...</option>
                  {shuttlecocks.map((shuttlecock) => (
                    <option key={shuttlecock.name} value={shuttlecock.name}>
                      {shuttlecock.name} (Rp {(shuttlecock.priceperpiece || 0).toLocaleString()}/biji)
                    </option>
                  ))}
                </select>
              </div>

              {/* Harga Shuttlecock */}
              <div>
                <label className="block text-sm font-bold mb-2 text-black dark:text-white">💰 Harga Shuttlecock per Biji</label>
                <input
                  type="text"
                  value={shuttlecockPrice ? `Rp ${shuttlecockPrice.toLocaleString()}` : 'Pilih shuttlecock dulu'}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                  style={{ borderColor: '#66B933' }}
                  placeholder="Rp 0"
                />
              </div>

              {/* Durasi Bermain */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-4 text-black dark:text-white">⏰ Durasi Bermain</label>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setDuration(num)}
                      className={`p-3 border font-bold text-sm transition-colors rounded-lg ${
                        duration === num
                          ? 'text-white shadow-lg'
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ 
                        backgroundColor: duration === num ? '#66B933' : undefined,
                        borderColor: duration === num ? '#66B933' : undefined
                      }}
                    >
                      {num} jam
                    </button>
                  ))}
                </div>
              </div>

              {/* Jumlah Shuttlecock */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-4 text-black dark:text-white">🔢 Jumlah Shuttlecock</label>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setShuttlecockCount(num)}
                      className={`p-3 border font-bold text-sm transition-colors rounded-lg ${
                        shuttlecockCount === num
                          ? 'text-white shadow-lg'
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ 
                        backgroundColor: shuttlecockCount === num ? '#66B933' : undefined,
                        borderColor: shuttlecockCount === num ? '#66B933' : undefined
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jumlah Pemain */}
            <div className="mt-6">
              <label className="block text-sm font-bold mb-4 text-black dark:text-white">👥 Jumlah Pemain</label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPlayerCount(num)}
                    className={`p-3 border font-bold text-sm transition-colors rounded-lg ${
                      playerCount === num
                        ? 'text-white shadow-lg'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ 
                      backgroundColor: playerCount === num ? '#66B933' : undefined,
                      borderColor: playerCount === num ? '#66B933' : undefined
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Rekening Bank */}
            <div className="mt-6">
              <label className="block text-sm font-bold mb-4 text-black dark:text-white">🏦 Tambah Rekening Bank</label>
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <select
                  value={newAccount.bankName}
                  onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                  className="p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  style={{ borderColor: '#66B933', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="">Pilih Bank...</option>
                  {bankOptions.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nomor Rekening"
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  style={{ borderColor: '#66B933' }}
                />
                <input
                  type="text"
                  placeholder="Nama Pemilik"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({...newAccount, accountName: e.target.value})}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  style={{ borderColor: '#66B933' }}
                />
                <button
                  onClick={addBankAccount}
                  className="px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200"
                  style={{ backgroundColor: '#66B933' }}
                >
                  Tambah
                </button>
              </div>
            </div>

            {/* Daftar Rekening Bank */}
            {bankAccounts.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-bold mb-4 text-gray-800 dark:text-gray-200">💳 Daftar Rekening Bank</label>
                <div className="grid md:grid-cols-2 gap-4">
                  {bankAccounts.map((account, index) => (
                    <div
                      key={index}
                      className="relative w-full h-56 bg-gradient-to-br text-white rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, #66B933 0%, #4a9025 50%, #2d5a16 100%)`,
                        aspectRatio: '1.6/1'
                      }}
                    >
                      {/* Card Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
                        <div className="absolute top-8 right-8 w-8 h-8 border border-white rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-lg rotate-45"></div>
                      </div>

                      {/* Chip */}
                      <div className="absolute top-6 left-6">
                        <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg shadow-lg">
                          <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-lg p-1">
                            <div className="w-full h-full bg-yellow-300 rounded grid grid-cols-3 gap-px">
                              {[...Array(9)].map((_, i) => (
                                <div key={i} className="bg-yellow-400 rounded-sm"></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bank Name */}
                      <div className="absolute top-6 right-6">
                        <div className="text-right">
                          <div className="text-lg font-black tracking-wider">{account.bankName}</div>
                          <div className="text-xs opacity-80 font-medium">DEBIT CARD</div>
                        </div>
                      </div>

                      {/* Card Number */}
                      <div className="absolute top-24 left-6 right-6">
                        <div className="text-xl font-mono font-bold tracking-widest mb-1">
                          {account.accountNumber.replace(/(\d{4})/g, '$1 ').trim()}
                        </div>
                        <div className="text-xs opacity-80 font-medium">CARD NUMBER</div>
                      </div>

                      {/* Card Holder */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-sm font-bold tracking-wide uppercase">
                              {account.accountName}
                            </div>
                            <div className="text-xs opacity-80 font-medium">CARD HOLDER</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">12/28</div>
                            <div className="text-xs opacity-80 font-medium">VALID THRU</div>
                          </div>
                        </div>
                      </div>

                      {/* Contactless Symbol */}
                      <div className="absolute top-20 right-6">
                        <div className="w-8 h-8 opacity-60">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <button
                          onClick={() => {
                            const updatedAccounts = bankAccounts.filter((_, i) => i !== index)
                            setBankAccounts(updatedAccounts)
                            if (selectedAccount === account) {
                              setSelectedAccount(null)
                            }
                          }}
                          className="px-3 py-1 bg-red-500/80 hover:bg-red-600 text-white text-xs rounded-full transition-colors duration-200"
                        >
                          Hapus
                        </button>
                      </div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-all duration-1000"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hasil Perhitungan - Badminton Scoreboard Style */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 mb-6 overflow-hidden relative">
            {/* LED Border Effect */}
            <div className="absolute inset-0 rounded-2xl border-4 border-green-400 opacity-60 animate-pulse"></div>
            
            {/* Header */}
            <div className="text-center mb-6 relative z-10">
              <div className="bg-green-500 text-black px-6 py-2 rounded-full inline-block font-black text-sm md:text-lg tracking-wider shadow-lg">
                🏸 PERHITUNGAN BIAYA AKHIR 🏸
              </div>
            </div>

            {selectedCourt && selectedShuttlecock && courtPrice > 0 && shuttlecockPrice > 0 ? (
              <div className="relative z-10">
                {/* Main Score Display */}
                <div className="bg-black rounded-xl p-6 mb-6 border-2 border-green-400">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {/* Duration */}
                    <div className="bg-gradient-to-b from-green-400 to-green-600 text-black rounded-lg p-4">
                      <div className="text-xs font-bold opacity-80">DURASI</div>
                      <div className="text-3xl font-black">{duration}</div>
                      <div className="text-xs font-bold opacity-80">JAM</div>
                    </div>
                    
                    {/* Players */}
                    <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 text-black rounded-lg p-4">
                      <div className="text-xs font-bold opacity-80">PEMAIN</div>
                      <div className="text-3xl font-black">{playerCount}</div>
                      <div className="text-xs font-bold opacity-80">ORANG</div>
                    </div>
                    
                    {/* Shuttlecocks */}
                    <div className="bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-lg p-4">
                      <div className="text-xs font-bold opacity-80">SHUTTLECOCK</div>
                      <div className="text-3xl font-black">{shuttlecockCount}</div>
                      <div className="text-xs font-bold opacity-80">BIJI</div>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-600">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-green-400">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        🏟️ Lapangan ({duration} jam)
                      </span>
                      <span className="font-mono font-bold">Rp {courtPrice && duration ? (courtPrice * duration).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between items-center text-yellow-400">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        🏸 Shuttlecock ({shuttlecockCount} biji)
                      </span>
                      <span className="font-mono font-bold">Rp {shuttlecockPrice && shuttlecockCount ? (shuttlecockPrice * shuttlecockCount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between items-center text-white text-lg">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          💳 TOTAL BIAYA
                        </span>
                        <span className="font-mono font-black">Rp {courtPrice && shuttlecockPrice && duration && shuttlecockCount ? ((courtPrice * duration) + (shuttlecockPrice * shuttlecockCount)).toLocaleString() : '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Score - Cost Per Person */}
                <div className="relative">
                  <div className="bg-gradient-to-r from-green-500 via-green-400 to-green-500 text-black rounded-2xl p-6 text-center shadow-2xl">
                    <div className="text-sm font-bold opacity-80 mb-2">BIAYA PER ORANG</div>
                    <div className="text-4xl md:text-6xl font-black tracking-wider mb-2">
                      Rp {calculateTotal() ? calculateTotal().toLocaleString() : '0'}
                    </div>
                    <div className="text-sm font-bold opacity-80">
                      {playerCount} PEMAIN • {selectedCourt?.name || 'Pilih lapangan'}
                    </div>
                  </div>
                  
                  {/* Celebration Effect */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 relative z-10">
                <div className="text-6xl mb-4">🏸</div>
                <p className="text-sm md:text-lg">Lengkapi data untuk melihat perhitungan biaya akhir</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <button
              onClick={exportReceipt}
              disabled={!selectedCourt || !selectedShuttlecock || courtPrice === 0 || shuttlecockPrice === 0}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <Download size={22} className="group-hover:animate-bounce" />
                <span className="text-sm md:text-base">Export Struk</span>
              </div>
            </button>

            <button
              onClick={saveBooking}
              disabled={!selectedCourt || !selectedShuttlecock || !playDate || courtPrice === 0 || shuttlecockPrice === 0}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <Download size={22} className="group-hover:animate-bounce" />
                <span className="text-sm md:text-base">Simpan Booking</span>
              </div>
            </button>
            
            <button
              onClick={shareToWhatsApp}
              disabled={!selectedCourt || !selectedShuttlecock || courtPrice === 0 || shuttlecockPrice === 0}
              className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <Share2 size={22} className="group-hover:animate-pulse" />
                <span className="text-sm md:text-base">Share WhatsApp</span>
              </div>
            </button>
          </div>

          {/* History Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowBookingHistory(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <History size={20} className="group-hover:animate-pulse" />
                <span className="text-sm md:text-base">Riwayat Booking</span>
              </div>
            </button>
          </div>

          {/* Booking History Modal */}
          <BookingHistory 
            isOpen={showBookingHistory} 
            onClose={() => setShowBookingHistory(false)} 
          />

          {/* Toast Notification */}
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={() => setToast({ ...toast, isVisible: false })}
          />
        </>)}
      </div>
    </div>
  )
}
