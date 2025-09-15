'use client'

import { useState, useEffect } from 'react'
import { Download, Share2, Upload } from 'lucide-react'

interface Court {
  name: string
  location: string
  pricePerHour: number
}

interface Shuttlecock {
  name: string
  pricePerPiece: number
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

  useEffect(() => {
    // Load data from JSON files
    fetch('/data/courts.json')
      .then(res => res.json())
      .then(data => setCourts(data))
      .catch(() => {
        // Fallback data
        setCourts([
          { name: 'GOR Senayan', location: 'Jakarta Pusat', pricePerHour: 150000 },
          { name: 'Badminton Hall BSD', location: 'Tangerang Selatan', pricePerHour: 120000 }
        ])
      })

    fetch('/data/shuttlecocks.json')
      .then(res => res.json())
      .then(data => setShuttlecocks(data))
      .catch(() => {
        // Fallback data
        setShuttlecocks([
          { name: 'Yonex AS-30', pricePerPiece: 25000 },
          { name: 'Victor Gold', pricePerPiece: 22000 }
        ])
      })

    fetch('/data/banks.json')
      .then(res => res.json())
      .then(data => setBankOptions(data))
      .catch(() => {
        // Fallback data
        setBankOptions(['BCA', 'BRI', 'BANK JAGO', 'ALADIN', 'BNI', 'BLU BY BCA', 'MANDIRI', 'CIMB NIAGA', 'DANAMON', 'PERMATA', 'MAYBANK', 'OCBC NISP', 'PANIN', 'BTN', 'BSI'])
      })
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

  const generateInvoice = () => {
    const total = calculateTotal()
    return {
      date: playDate,
      duration,
      court: selectedCourt,
      courtPrice,
      shuttlecock: selectedShuttlecock,
      shuttlecockPrice,
      shuttlecockCount,
      playerCount,
      account: selectedAccount,
      bankAccounts,
      costPerPerson: total,
      totalCost: selectedCourt && selectedShuttlecock ? 
        (courtPrice * duration) + (shuttlecockPrice * shuttlecockCount) : 0
    }
  }

  const exportReceipt = () => {
    const invoice = generateInvoice()
    const receipt = `
═══════════════════════════════════════
           🏸 STRUK BADMINTON 🏸
═══════════════════════════════════════

📅 Tanggal      : ${formatDateToIndonesian(invoice.date)}
⏰ Durasi       : ${invoice.duration} jam
🏟️ Lapangan     : ${invoice.court?.name}
📍 Lokasi       : ${invoice.court?.location}

───────────────────────────────────────
                RINCIAN BIAYA
───────────────────────────────────────

🏟️ Sewa Lapangan
   ${invoice.duration} jam × Rp ${invoice.courtPrice.toLocaleString()}
   = Rp ${(invoice.courtPrice * invoice.duration).toLocaleString()}

🏸 Shuttlecock
   ${invoice.shuttlecockCount} biji × Rp ${invoice.shuttlecockPrice.toLocaleString()}
   (${invoice.shuttlecock?.name})
   = Rp ${(invoice.shuttlecockPrice * invoice.shuttlecockCount).toLocaleString()}

───────────────────────────────────────
💰 TOTAL BIAYA  : Rp ${invoice.totalCost.toLocaleString()}
👥 JUMLAH ORANG : ${invoice.playerCount} orang
💳 BIAYA/ORANG  : Rp ${invoice.costPerPerson.toLocaleString()}

${invoice.bankAccounts && invoice.bankAccounts.length > 0 ? `───────────────────────────────────────
              TRANSFER KE:
───────────────────────────────────────
${invoice.bankAccounts.map(account => 
`🏦 Bank         : ${account.bankName}
💳 No. Rekening : ${account.accountNumber}
👤 Atas Nama    : ${account.accountName}`
).join('\n\n')}` : ''}

═══════════════════════════════════════
        Terima kasih sudah bermain!
═══════════════════════════════════════
`
    const blob = new Blob([receipt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `struk-badminton-${playDate}.txt`
    a.click()
  }

  const shareToWhatsApp = () => {
    const invoice = generateInvoice()
    const message = `🏸 *INVOICE BADMINTON*

📅 Tanggal: ${formatDateToIndonesian(invoice.date)}
⏰ Durasi: ${invoice.duration} jam
🏟️ Lapangan: ${invoice.court?.name} - ${invoice.court?.location}
💰 Harga Lapangan: Rp ${invoice.courtPrice.toLocaleString()} x ${invoice.duration} jam

🏸 Shuttlecock: ${invoice.shuttlecock?.name}
💰 Harga Shuttlecock: Rp ${invoice.shuttlecockPrice.toLocaleString()} x ${invoice.shuttlecockCount} biji

👥 Jumlah Pemain: ${invoice.playerCount} orang
💳 Total Biaya: Rp ${invoice.totalCost.toLocaleString()}
💰 *Biaya per Orang: Rp ${invoice.costPerPerson.toLocaleString()}*

${invoice.bankAccounts && invoice.bankAccounts.length > 0 ? `🏦 Transfer ke:
${invoice.bankAccounts.map(account => 
`${account.bankName} - ${account.accountNumber}
a.n ${account.accountName}`
).join('\n\n')}` : ''}`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
  }

  const importInvoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          setPlayDate(data.date || '')
          setDuration(data.duration || 1)
          setSelectedCourt(data.court)
          setCourtPrice(data.courtPrice || 0)
          setSelectedShuttlecock(data.shuttlecock)
          setShuttlecockPrice(data.shuttlecockPrice || 0)
          setShuttlecockCount(data.shuttlecockCount || 1)
          setPlayerCount(data.playerCount || 1)
          setSelectedAccount(data.account)
          if (data.bankAccounts) {
            setBankAccounts(data.bankAccounts)
          }
        } catch (error) {
          alert('File tidak valid')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-green-200 to-yellow-200 p-4" style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-300 border-4 border-gray-400 rounded-none shadow-lg mb-6 p-1" style={{
          borderStyle: 'outset',
          borderWidth: '3px'
        }}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2 border border-red-700"></div>
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 border border-yellow-700"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full mr-4 border border-green-700"></div>
            <h1 className="text-xl font-bold">🏸 Kalkulator Badminton</h1>
          </div>
        </div>

        <div className="bg-gray-200 border-4 rounded-none shadow-lg p-6 mb-6" style={{
          borderStyle: 'inset',
          borderWidth: '2px',
          borderColor: '#c0c0c0'
        }}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tanggal */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2 text-black">📅 Tanggal Bermain</label>
              <input
                type="date"
                value={playDate}
                onChange={(e) => setPlayDate(e.target.value)}
                className="w-full p-2 border-2 rounded-none bg-white text-black"
                style={{ borderStyle: 'inset', borderColor: '#808080' }}
              />
              {playDate && (
                <div className="mt-1 text-sm text-gray-600 font-medium">
                  {formatDateToIndonesian(playDate)}
                </div>
              )}
            </div>

            {/* Lapangan */}
            <div>
              <label className="block text-sm font-bold mb-2 text-black">🏟️ Pilih Lapangan</label>
              <select
                value={selectedCourt?.name || ''}
                onChange={(e) => {
                  const court = courts.find(c => c.name === e.target.value)
                  setSelectedCourt(court || null)
                }}
                className="w-full p-2 border-2 rounded-none bg-white text-black"
                style={{ borderStyle: 'inset', borderColor: '#808080' }}
              >
                <option value="">Pilih lapangan...</option>
                {courts.map((court) => (
                  <option key={court.name} value={court.name}>
                    {court.name} - {court.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Harga Lapangan */}
            <div>
              <label className="block text-sm font-bold mb-2 text-black">💰 Harga Lapangan per Jam</label>
              <input
                type="text"
                value={courtPrice ? `Rp ${courtPrice.toLocaleString()}` : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  setCourtPrice(parseInt(value) || 0)
                }}
                className="w-full p-2 border-2 rounded-none bg-white text-black"
                style={{ borderStyle: 'inset', borderColor: '#808080' }}
                placeholder="Rp 0"
              />
            </div>

            {/* Shuttlecock */}
            <div>
              <label className="block text-sm font-bold mb-2 text-black">🏸 Pilih Shuttlecock</label>
              <select
                value={selectedShuttlecock?.name || ''}
                onChange={(e) => {
                  const shuttlecock = shuttlecocks.find(s => s.name === e.target.value)
                  setSelectedShuttlecock(shuttlecock || null)
                }}
                className="w-full p-2 border-2 rounded-none bg-white text-black"
                style={{ borderStyle: 'inset', borderColor: '#808080' }}
              >
                <option value="">Pilih shuttlecock...</option>
                {shuttlecocks.map((shuttlecock) => (
                  <option key={shuttlecock.name} value={shuttlecock.name}>
                    {shuttlecock.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Harga Shuttlecock */}
            <div>
              <label className="block text-sm font-bold mb-2 text-black">💰 Harga Shuttlecock per Biji</label>
              <input
                type="text"
                value={shuttlecockPrice ? `Rp ${shuttlecockPrice.toLocaleString()}` : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  setShuttlecockPrice(parseInt(value) || 0)
                }}
                className="w-full p-2 border-2 rounded-none bg-white text-black"
                style={{ borderStyle: 'inset', borderColor: '#808080' }}
                placeholder="Rp 0"
              />
            </div>

            {/* Durasi Bermain */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-4 text-black">⏰ Durasi Bermain</label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setDuration(num)}
                    className={`p-2 border-2 font-bold text-sm transition-colors ${
                      duration === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-black hover:bg-gray-400'
                    }`}
                    style={{ 
                      borderStyle: duration === num ? 'inset' : 'outset',
                      borderColor: '#808080'
                    }}
                  >
                    {num} jam
                  </button>
                ))}
              </div>
            </div>

            {/* Jumlah Shuttlecock */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-4 text-black">🔢 Jumlah Shuttlecock</label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setShuttlecockCount(num)}
                    className={`p-2 border-2 font-bold text-sm transition-colors ${
                      shuttlecockCount === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-black hover:bg-gray-400'
                    }`}
                    style={{ 
                      borderStyle: shuttlecockCount === num ? 'inset' : 'outset',
                      borderColor: '#808080'
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
            <label className="block text-sm font-bold mb-4 text-black">👥 Jumlah Pemain</label>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPlayerCount(num)}
                  className={`p-2 border-2 font-bold text-sm transition-colors ${
                    playerCount === num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-black hover:bg-gray-400'
                  }`}
                  style={{ 
                    borderStyle: playerCount === num ? 'inset' : 'outset',
                    borderColor: '#808080'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Input Rekening Bank */}
          <div className="mt-6">
            <label className="block text-sm font-bold mb-4 text-black">🏦 Tambah Rekening Bank</label>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <select
                value={newAccount.bankName}
                onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                className="p-2 border-2 rounded-none bg-white text-black"
                style={{ borderStyle: 'inset', borderColor: '#808080' }}
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
                className="p-2 border-2 rounded-none bg-white text-black"
                style={{ borderStyle: 'inset', borderColor: '#808080' }}
              />
              <input
                type="text"
                placeholder="Nama Pemilik"
                value={newAccount.accountName}
                onChange={(e) => setNewAccount({...newAccount, accountName: e.target.value})}
                className="p-2 border-2 rounded-none bg-white text-black"
                style={{ borderStyle: 'inset', borderColor: '#808080' }}
              />
              <button
                onClick={addBankAccount}
                className="px-4 py-2 bg-gray-300 text-black font-bold border-2 hover:bg-gray-400"
                style={{ borderStyle: 'outset', borderColor: '#808080' }}
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Pilih Rekening Bank */}
          {bankAccounts.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-bold mb-4 text-black">💳 Pilih Rekening untuk Transfer</label>
              <div className="grid md:grid-cols-2 gap-4">
                {bankAccounts.map((account, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedAccount(account)}
                    className={`p-4 border-2 cursor-pointer transition-colors ${
                      selectedAccount?.accountNumber === account.accountNumber
                        ? 'bg-blue-200 border-blue-600'
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-400'
                    }`}
                    style={{ 
                      borderStyle: selectedAccount?.accountNumber === account.accountNumber ? 'inset' : 'outset',
                      borderColor: selectedAccount?.accountNumber === account.accountNumber ? '#2563eb' : '#808080'
                    }}
                  >
                    <div className="font-bold text-lg text-black mb-2">{account.bankName}</div>
                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">No. Rekening:</span> {account.accountNumber}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Atas Nama:</span> {account.accountName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hasil Perhitungan */}
        <div className="bg-gray-200 border-4 rounded-none shadow-lg p-6 mb-6" style={{
          borderStyle: 'inset',
          borderWidth: '2px',
          borderColor: '#c0c0c0'
        }}>
          <h2 className="text-xl font-bold mb-4 text-black">💰 Hasil Perhitungan</h2>
          {selectedCourt && selectedShuttlecock && courtPrice > 0 && shuttlecockPrice > 0 ? (
            <div className="space-y-2 text-black">
              <div className="flex justify-between">
                <span>⏱️ Durasi Bermain:</span>
                <span className="font-bold">{duration} jam</span>
              </div>
              <div className="flex justify-between">
                <span>🏟️ Biaya Lapangan ({duration} jam):</span>
                <span>Rp {(courtPrice * duration).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>🏸 Biaya Shuttlecock ({shuttlecockCount} biji):</span>
                <span>Rp {(shuttlecockPrice * shuttlecockCount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t-2 pt-2 border-gray-400">
                <span>💳 Total Biaya:</span>
                <span>Rp {((courtPrice * duration) + (shuttlecockPrice * shuttlecockCount)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold bg-yellow-200 p-3 border-2" style={{
                borderStyle: 'inset',
                borderColor: '#808080'
              }}>
                <span>💰 Biaya per Orang ({playerCount} orang):</span>
                <span>Rp {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Lengkapi data untuk melihat perhitungan</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={exportReceipt}
            disabled={!selectedCourt || !selectedShuttlecock || courtPrice === 0 || shuttlecockPrice === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-black font-bold border-2 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
            style={{ borderStyle: 'outset', borderColor: '#808080' }}
          >
            <Download size={20} />
            Export Struk
          </button>
          
          <button
            onClick={shareToWhatsApp}
            disabled={!selectedCourt || !selectedShuttlecock || courtPrice === 0 || shuttlecockPrice === 0}
            className="flex items-center gap-2 px-6 py-3 bg-green-400 text-black font-bold border-2 hover:bg-green-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
            style={{ borderStyle: 'outset', borderColor: '#808080' }}
          >
            <Share2 size={20} />
            Share ke WhatsApp
          </button>
          
          <label className="flex items-center gap-2 px-6 py-3 bg-blue-400 text-black font-bold border-2 hover:bg-blue-500 cursor-pointer"
            style={{ borderStyle: 'outset', borderColor: '#808080' }}>
            <Upload size={20} />
            Import Invoice
            <input
              type="file"
              accept=".json"
              onChange={importInvoice}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
