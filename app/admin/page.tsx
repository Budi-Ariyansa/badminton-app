'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Court {
  name: string
  location: string
  pricePerHour: number
}

interface Shuttlecock {
  name: string
  pricePerPiece: number
}

export default function AdminPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [courts, setCourts] = useState<Court[]>([])
  const [shuttlecocks, setShuttlecocks] = useState<Shuttlecock[]>([])
  const [bankOptions, setBankOptions] = useState<string[]>([])
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [editingShuttlecock, setEditingShuttlecock] = useState<Shuttlecock | null>(null)
  const [newCourt, setNewCourt] = useState<Court>({ name: '', location: '', pricePerHour: 0 })
  const [newShuttlecock, setNewShuttlecock] = useState<Shuttlecock>({ name: '', pricePerPiece: 0 })
  const [newBank, setNewBank] = useState('')

  useEffect(() => {
    if (isLoggedIn) {
      // Load data from API endpoints
      fetch('/api/courts')
        .then(res => res.json())
        .then(data => setCourts(data))
        .catch(() => setCourts([]))

      fetch('/api/shuttlecocks')
        .then(res => res.json())
        .then(data => setShuttlecocks(data))
        .catch(() => setShuttlecocks([]))

      fetch('/api/banks')
        .then(res => res.json())
        .then(data => setBankOptions(data))
        .catch(() => setBankOptions([]))
    }
  }, [isLoggedIn])

  const handleLogin = () => {
    if (loginForm.username === 'adminpbkm' && loginForm.password === 'adminpbkm1010') {
      setIsLoggedIn(true)
      setShowLogin(false)
    } else {
      alert('Username atau password salah!')
    }
  }

  const addCourt = () => {
    if (newCourt.name && newCourt.location && newCourt.pricePerHour > 0) {
      const updatedCourts = [...courts, newCourt]
      setCourts(updatedCourts)
      saveCourts(updatedCourts)
      setNewCourt({ name: '', location: '', pricePerHour: 0 })
    }
  }

  const updateCourt = () => {
    if (editingCourt) {
      const updatedCourts = courts.map(c => c.name === editingCourt.name ? editingCourt : c)
      setCourts(updatedCourts)
      saveCourts(updatedCourts)
      setEditingCourt(null)
    }
  }

  const deleteCourt = (name: string) => {
    const updatedCourts = courts.filter(c => c.name !== name)
    setCourts(updatedCourts)
    saveCourts(updatedCourts)
  }

  const saveCourts = (courtsData: any[]) => {
    fetch('/api/courts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courtsData)
    })
  }

  const addShuttlecock = () => {
    if (newShuttlecock.name && newShuttlecock.pricePerPiece > 0) {
      const updatedShuttlecocks = [...shuttlecocks, newShuttlecock]
      setShuttlecocks(updatedShuttlecocks)
      saveShuttlecocks(updatedShuttlecocks)
      setNewShuttlecock({ name: '', pricePerPiece: 0 })
    }
  }

  const updateShuttlecock = () => {
    if (editingShuttlecock) {
      const updatedShuttlecocks = shuttlecocks.map(s => s.name === editingShuttlecock.name ? editingShuttlecock : s)
      setShuttlecocks(updatedShuttlecocks)
      saveShuttlecocks(updatedShuttlecocks)
      setEditingShuttlecock(null)
    }
  }

  const deleteShuttlecock = (name: string) => {
    const updatedShuttlecocks = shuttlecocks.filter(s => s.name !== name)
    setShuttlecocks(updatedShuttlecocks)
    saveShuttlecocks(updatedShuttlecocks)
  }

  const saveShuttlecocks = (shuttlecocksData: any[]) => {
    fetch('/api/shuttlecocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shuttlecocksData)
    })
  }

  // Save functions
  const saveBanks = async () => {
    await fetch('/api/banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bankOptions)
    })
  }

  const addBank = async () => {
    if (newBank && !bankOptions.includes(newBank)) {
      const updatedBanks = [...bankOptions, newBank]
      setBankOptions(updatedBanks)
      setNewBank('')
      
      // Save to server
      await fetch('/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBanks)
      })
    }
  }

  const deleteBank = async (bank: string) => {
    const updatedBanks = bankOptions.filter(b => b !== bank)
    setBankOptions(updatedBanks)
    
    // Save to server
    await fetch('/api/banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBanks)
    })
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border-2 rounded-xl p-8 shadow-lg" style={{ 
          borderColor: '#66B933'
        }}>
          <h2 className="text-2xl font-black mb-6 text-gray-800 text-center">🔐 ADMIN LOGIN</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#66B933' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#66B933' }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                className="px-4 py-2 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200"
                style={{ backgroundColor: '#66B933' }}
              >
                Login
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          {/* Header */}
          <div className="text-white p-3 md:p-6" style={{ 
            background: 'linear-gradient(135deg, #66B933 0%, #4a9025 100%)',
            boxShadow: '0 4px 20px rgba(102, 185, 51, 0.3)'
          }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
              {/* Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-lg md:text-xl">⚙️</span>
                </div>
                <div>
                  <h1 className="text-base md:text-xl font-black tracking-wide">ADMIN PANEL</h1>
                  <p className="text-xs md:text-sm opacity-80 font-medium">Kelola data lapangan, shuttlecock & bank</p>
                </div>
              </div>
              
              {/* Back Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg text-xs md:text-sm font-bold hover:bg-opacity-30 transition-all duration-200"
                >
                  <span className="text-xs md:text-sm">🏸</span>
                  <span>KALKULATOR</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Manage Courts */}
            <div>
              <h3 className="font-bold mb-4 text-black">🏟️ Kelola Lapangan</h3>
              
              {/* Add New Court */}
              <div className="bg-gray-50 p-4 border rounded-lg mb-4" style={{ borderColor: '#66B933' }}>
                <h4 className="font-bold mb-2 text-gray-800">Tambah Lapangan Baru</h4>
                <div className="grid md:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nama Lapangan"
                    value={newCourt.name}
                    onChange={(e) => setNewCourt({...newCourt, name: e.target.value})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ borderColor: '#66B933' }}
                  />
                  <input
                    type="text"
                    placeholder="Lokasi"
                    value={newCourt.location}
                    onChange={(e) => setNewCourt({...newCourt, location: e.target.value})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ borderColor: '#66B933' }}
                  />
                  <input
                    type="number"
                    placeholder="Harga per Jam"
                    value={newCourt.pricePerHour || ''}
                    onChange={(e) => setNewCourt({...newCourt, pricePerHour: parseInt(e.target.value) || 0})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ borderColor: '#66B933' }}
                  />
                </div>
                <button
                  onClick={addCourt}
                  className="w-full px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200"
                  style={{ backgroundColor: '#66B933' }}
                >
                  Tambah
                </button>
              </div>

              {/* Courts List */}
              <div className="space-y-2">
                {courts.map((court, index) => (
                  <div key={index} className="bg-white p-4 border rounded-lg shadow-sm flex items-center justify-between" style={{ borderColor: '#66B933' }}>
                    {editingCourt?.name === court.name ? (
                      <div className="flex-1 grid md:grid-cols-3 gap-2 mr-2">
                        <input
                          type="text"
                          value={editingCourt.name}
                          onChange={(e) => setEditingCourt({...editingCourt, name: e.target.value})}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{ borderColor: '#66B933' }}
                        />
                        <input
                          type="text"
                          value={editingCourt.location}
                          onChange={(e) => setEditingCourt({...editingCourt, location: e.target.value})}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{ borderColor: '#66B933' }}
                        />
                        <input
                          type="number"
                          value={editingCourt.pricePerHour}
                          onChange={(e) => setEditingCourt({...editingCourt, pricePerHour: parseInt(e.target.value) || 0})}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{ borderColor: '#66B933' }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-black">
                        <strong>{court.name}</strong> - {court.location} - Rp {court.pricePerHour.toLocaleString()}/jam
                      </div>
                    )}
                    <div className="flex gap-1">
                      {editingCourt?.name === court.name ? (
                        <>
                          <button
                            onClick={updateCourt}
                            className="px-2 py-1 text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200"
                            style={{ backgroundColor: '#66B933' }}
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingCourt(null)}
                            className="px-2 py-1 bg-black text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingCourt(court)}
                            className="px-2 py-1 text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200"
                            style={{ backgroundColor: '#66B933' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCourt(court.name)}
                            className="px-2 py-1 bg-black text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manage Shuttlecocks */}
            <div>
              <h3 className="font-bold mb-4 text-black">🏸 Kelola Shuttlecock</h3>
              
              {/* Add New Shuttlecock */}
              <div className="bg-gray-50 p-4 border rounded-lg mb-4" style={{ borderColor: '#66B933' }}>
                <h4 className="font-bold mb-2 text-gray-800">Tambah Shuttlecock Baru</h4>
                <div className="grid md:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nama Shuttlecock"
                    value={newShuttlecock.name}
                    onChange={(e) => setNewShuttlecock({...newShuttlecock, name: e.target.value})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ borderColor: '#66B933' }}
                  />
                  <input
                    type="number"
                    placeholder="Harga per Biji"
                    value={newShuttlecock.pricePerPiece || ''}
                    onChange={(e) => setNewShuttlecock({...newShuttlecock, pricePerPiece: parseInt(e.target.value) || 0})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ borderColor: '#66B933' }}
                  />
                </div>
                <button
                  onClick={addShuttlecock}
                  className="w-full px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200"
                  style={{ backgroundColor: '#66B933' }}
                >
                  Tambah
                </button>
              </div>

              {/* Shuttlecocks List */}
              <div className="space-y-2">
                {shuttlecocks.map((shuttlecock, index) => (
                  <div key={index} className="bg-white p-4 border rounded-lg shadow-sm flex items-center justify-between" style={{ borderColor: '#66B933' }}>
                    {editingShuttlecock?.name === shuttlecock.name ? (
                      <div className="flex-1 grid md:grid-cols-2 gap-2 mr-2">
                        <input
                          type="text"
                          value={editingShuttlecock.name}
                          onChange={(e) => setEditingShuttlecock({...editingShuttlecock, name: e.target.value})}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{ borderColor: '#66B933' }}
                        />
                        <input
                          type="number"
                          value={editingShuttlecock.pricePerPiece}
                          onChange={(e) => setEditingShuttlecock({...editingShuttlecock, pricePerPiece: parseInt(e.target.value) || 0})}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{ borderColor: '#66B933' }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-black">
                        <strong>{shuttlecock.name}</strong> - Rp {shuttlecock.pricePerPiece.toLocaleString()}/biji
                      </div>
                    )}
                    <div className="flex gap-1">
                      {editingShuttlecock?.name === shuttlecock.name ? (
                        <>
                          <button
                            onClick={updateShuttlecock}
                            className="px-2 py-1 text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200"
                            style={{ backgroundColor: '#66B933' }}
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingShuttlecock(null)}
                            className="px-2 py-1 bg-black text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingShuttlecock(shuttlecock)}
                            className="px-2 py-1 text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200"
                            style={{ backgroundColor: '#66B933' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteShuttlecock(shuttlecock.name)}
                            className="px-2 py-1 bg-black text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manage Banks */}
            <div>
              <h3 className="font-bold mb-4 text-black">🏦 Kelola Bank</h3>
              
              {/* Add New Bank */}
              <div className="bg-gray-50 p-4 border rounded-lg mb-4" style={{ borderColor: '#66B933' }}>
                <h4 className="font-bold mb-2 text-gray-800">Tambah Bank Baru</h4>
                <input
                  type="text"
                  placeholder="Nama Bank"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent mb-3"
                  style={{ borderColor: '#66B933' }}
                />
                <button
                  onClick={addBank}
                  className="w-full px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200"
                  style={{ backgroundColor: '#66B933' }}
                >
                  Tambah
                </button>
              </div>

              {/* Banks List */}
              <div className="grid md:grid-cols-3 gap-2">
                {bankOptions.map((bank, index) => (
                  <div key={index} className="bg-white p-4 border rounded-lg shadow-sm flex items-center justify-between" style={{ borderColor: '#66B933' }}>
                    <span className="text-black font-medium">{bank}</span>
                    <button
                      onClick={() => deleteBank(bank)}
                      className="px-2 py-1 bg-black text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
