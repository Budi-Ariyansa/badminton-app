'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '../components/ThemeToggle'
import Toast from '../components/Toast'
import Loading from '../components/Loading'

interface Court {
  name: string
  location: string
  priceperhour: number
}

interface Shuttlecock {
  name: string
  priceperpiece: number
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
  const [newCourt, setNewCourt] = useState<Court>({ name: '', location: '', priceperhour: 0 })
  const [newShuttlecock, setNewShuttlecock] = useState<Shuttlecock>({ name: '', priceperpiece: 0 })
  const [newBank, setNewBank] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', isVisible: false })
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStates, setLoadingStates] = useState({
    addCourt: false,
    editCourt: false,
    deleteCourt: false,
    addShuttlecock: false,
    editShuttlecock: false,
    deleteShuttlecock: false,
    addBank: false,
    deleteBank: false
  })

  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true)
      // Load data from API endpoints
      Promise.all([
        fetch('/api/courts').then(res => res.json()).catch(() => []),
        fetch('/api/shuttlecocks').then(res => res.json()).catch(() => []),
        fetch('/api/banks').then(res => res.json()).catch(() => [])
      ]).then(([courtsData, shuttlecocksData, banksData]) => {
        setCourts(courtsData)
        setShuttlecocks(shuttlecocksData)
        setBankOptions(banksData)
        setIsLoading(false)
      })
    }
  }, [isLoggedIn])

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (loginForm.username === 'adminpbkm' && loginForm.password === 'adminpbkm1010') {
      setIsLoggedIn(true)
      setShowLogin(false)
      showToast('Login berhasil! Selamat datang Admin.', 'success')
    } else {
      showToast('Username atau password salah!', 'error')
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true })
  }

  const addCourt = async () => {
    if (newCourt.name && newCourt.location && newCourt.priceperhour > 0) {
      setLoadingStates(prev => ({ ...prev, addCourt: true }))
      try {
        const updatedCourts = [...courts, newCourt]
        setCourts(updatedCourts)
        await saveCourts(updatedCourts)
        setNewCourt({ name: '', location: '', priceperhour: 0 })
        showToast('Lapangan berhasil ditambahkan!', 'success')
      } catch (error) {
        showToast('Gagal menambahkan lapangan!', 'error')
      } finally {
        setLoadingStates(prev => ({ ...prev, addCourt: false }))
      }
    } else {
      showToast('Mohon lengkapi semua data lapangan!', 'error')
    }
  }

  const updateCourt = async () => {
    if (editingCourt) {
      setLoadingStates(prev => ({ ...prev, editCourt: true }))
      try {
        const updatedCourts = courts.map(c => c.name === editingCourt.name ? editingCourt : c)
        setCourts(updatedCourts)
        await saveCourts(updatedCourts)
        setEditingCourt(null)
        showToast('Lapangan berhasil diperbarui!', 'success')
      } catch (error) {
        showToast('Gagal memperbarui lapangan!', 'error')
      } finally {
        setLoadingStates(prev => ({ ...prev, editCourt: false }))
      }
    }
  }

  const deleteCourt = async (name: string) => {
    setLoadingStates(prev => ({ ...prev, deleteCourt: true }))
    try {
      const updatedCourts = courts.filter(c => c.name !== name)
      setCourts(updatedCourts)
      await saveCourts(updatedCourts)
      showToast('Lapangan berhasil dihapus!', 'success')
    } catch (error) {
      showToast('Gagal menghapus lapangan!', 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteCourt: false }))
    }
  }

  const saveCourts = async (courtsData: any[]) => {
    try {
      const response = await fetch('/api/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courtsData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save courts')
      }
    } catch (error) {
      console.error('Error saving courts:', error)
      showToast('Gagal menyimpan data lapangan!', 'error')
    }
  }

  const addShuttlecock = async () => {
    if (newShuttlecock.name && newShuttlecock.priceperpiece > 0) {
      setLoadingStates(prev => ({ ...prev, addShuttlecock: true }))
      try {
        const updatedShuttlecocks = [...shuttlecocks, newShuttlecock]
        setShuttlecocks(updatedShuttlecocks)
        await saveShuttlecocks(updatedShuttlecocks)
        setNewShuttlecock({ name: '', priceperpiece: 0 })
        showToast('Shuttlecock berhasil ditambahkan!', 'success')
      } catch (error) {
        showToast('Gagal menambahkan shuttlecock!', 'error')
      } finally {
        setLoadingStates(prev => ({ ...prev, addShuttlecock: false }))
      }
    } else {
      showToast('Mohon lengkapi semua data shuttlecock!', 'error')
    }
  }

  const updateShuttlecock = async () => {
    if (editingShuttlecock) {
      setLoadingStates(prev => ({ ...prev, editShuttlecock: true }))
      try {
        const updatedShuttlecocks = shuttlecocks.map(s => s.name === editingShuttlecock.name ? editingShuttlecock : s)
        setShuttlecocks(updatedShuttlecocks)
        await saveShuttlecocks(updatedShuttlecocks)
        setEditingShuttlecock(null)
        showToast('Shuttlecock berhasil diperbarui!', 'success')
      } catch (error) {
        showToast('Gagal memperbarui shuttlecock!', 'error')
      } finally {
        setLoadingStates(prev => ({ ...prev, editShuttlecock: false }))
      }
    }
  }

  const deleteShuttlecock = async (name: string) => {
    setLoadingStates(prev => ({ ...prev, deleteShuttlecock: true }))
    try {
      const updatedShuttlecocks = shuttlecocks.filter(s => s.name !== name)
      setShuttlecocks(updatedShuttlecocks)
      await saveShuttlecocks(updatedShuttlecocks)
      showToast('Shuttlecock berhasil dihapus!', 'success')
    } catch (error) {
      showToast('Gagal menghapus shuttlecock!', 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteShuttlecock: false }))
    }
  }

  const saveShuttlecocks = async (shuttlecocksData: any[]) => {
    try {
      const response = await fetch('/api/shuttlecocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shuttlecocksData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save shuttlecocks')
      }
    } catch (error) {
      console.error('Error saving shuttlecocks:', error)
      showToast('Gagal menyimpan data shuttlecock!', 'error')
    }
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
      setLoadingStates(prev => ({ ...prev, addBank: true }))
      try {
        const updatedBanks = [...bankOptions, newBank]
        setBankOptions(updatedBanks)
        setNewBank('')
        
        await fetch('/api/banks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBanks)
        })
        showToast('Bank berhasil ditambahkan!', 'success')
      } catch (error) {
        showToast('Gagal menyimpan data bank!', 'error')
      } finally {
        setLoadingStates(prev => ({ ...prev, addBank: false }))
      }
    } else if (bankOptions.includes(newBank)) {
      showToast('Bank sudah ada dalam daftar!', 'error')
    } else {
      showToast('Mohon masukkan nama bank!', 'error')
    }
  }

  const deleteBank = async (bank: string) => {
    setLoadingStates(prev => ({ ...prev, deleteBank: true }))
    try {
      const updatedBanks = bankOptions.filter(b => b !== bank)
      setBankOptions(updatedBanks)
      
      await fetch('/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBanks)
      })
      showToast('Bank berhasil dihapus!', 'success')
    } catch (error) {
      showToast('Gagal menghapus data bank!', 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteBank: false }))
    }
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="bg-white dark:bg-gray-800 border-2 rounded-xl p-8 shadow-lg" style={{ 
          borderColor: '#66B933'
        }}>
          <h2 className="text-2xl font-black mb-6 text-gray-800 dark:text-gray-200 text-center">🔐 ADMIN LOGIN</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              style={{ borderColor: '#66B933' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              style={{ borderColor: '#66B933' }}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200"
                style={{ backgroundColor: '#66B933' }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                Kembali
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <Loading message="Memuat data admin..." />
          </div>
        ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden">
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
              <h3 className="font-bold mb-4 text-black dark:text-white">🏟️ Kelola Lapangan</h3>
              
              {/* Add New Court */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 border rounded-lg mb-4" style={{ borderColor: '#66B933' }}>
                <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-200">Tambah Lapangan Baru</h4>
                <div className="grid md:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nama Lapangan"
                    value={newCourt.name}
                    onChange={(e) => setNewCourt({...newCourt, name: e.target.value})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    style={{ borderColor: '#66B933' }}
                  />
                  <input
                    type="text"
                    placeholder="Lokasi"
                    value={newCourt.location}
                    onChange={(e) => setNewCourt({...newCourt, location: e.target.value})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    style={{ borderColor: '#66B933' }}
                  />
                  <input
                    type="number"
                    placeholder="Harga per Jam"
                    value={newCourt.priceperhour || ''}
                    onChange={(e) => setNewCourt({...newCourt, priceperhour: parseInt(e.target.value) || 0})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    style={{ borderColor: '#66B933' }}
                  />
                </div>
                <button
                  onClick={addCourt}
                  disabled={loadingStates.addCourt}
                  className="w-full px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                  style={{ backgroundColor: '#66B933' }}
                >
                  {loadingStates.addCourt ? 'Menambahkan...' : 'Tambah'}
                </button>
              </div>

              {/* Courts List */}
              <div className="space-y-2">
                {courts.map((court, index) => (
                  <div key={index} className="bg-white dark:bg-gray-600 p-4 border rounded-lg shadow-sm flex items-center justify-between" style={{ borderColor: '#66B933' }}>
                    {editingCourt?.name === court.name ? (
                      <div className="flex-1 grid md:grid-cols-3 gap-2 mr-2">
                        <input
                          type="text"
                          value={editingCourt.name}
                          onChange={(e) => setEditingCourt({...editingCourt, name: e.target.value})}
                          disabled={loadingStates.editCourt}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ borderColor: '#66B933' }}
                        />
                        <input
                          type="text"
                          value={editingCourt.location}
                          onChange={(e) => setEditingCourt({...editingCourt, location: e.target.value})}
                          disabled={loadingStates.editCourt}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ borderColor: '#66B933' }}
                        />
                        <input
                          type="number"
                          value={editingCourt.priceperhour}
                          onChange={(e) => setEditingCourt({...editingCourt, priceperhour: parseInt(e.target.value) || 0})}
                          disabled={loadingStates.editCourt}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ borderColor: '#66B933' }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-black dark:text-white">
                        <strong>{court.name}</strong> - {court.location} - Rp {(court.priceperhour || 0).toLocaleString()}/jam
                      </div>
                    )}
                    <div className="flex gap-1">
                      {editingCourt?.name === court.name ? (
                        <>
                          <button
                            onClick={updateCourt}
                            disabled={loadingStates.editCourt}
                            className="px-2 py-1 text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                            style={{ backgroundColor: '#66B933' }}
                          >
                            {loadingStates.editCourt ? 'Menyimpan...' : 'Simpan'}
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
                            disabled={loadingStates.deleteCourt}
                            className="px-2 py-1 bg-black text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                          >
                            {loadingStates.deleteCourt ? 'Menghapus...' : 'Hapus'}
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
              <h3 className="font-bold mb-4 text-black dark:text-white">🏸 Kelola Shuttlecock</h3>
              
              {/* Add New Shuttlecock */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 border rounded-lg mb-4" style={{ borderColor: '#66B933' }}>
                <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-200">Tambah Shuttlecock Baru</h4>
                <div className="grid md:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nama Shuttlecock"
                    value={newShuttlecock.name}
                    onChange={(e) => setNewShuttlecock({...newShuttlecock, name: e.target.value})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    style={{ borderColor: '#66B933' }}
                  />
                  <input
                    type="number"
                    placeholder="Harga per Biji"
                    value={newShuttlecock.priceperpiece || ''}
                    onChange={(e) => setNewShuttlecock({...newShuttlecock, priceperpiece: parseInt(e.target.value) || 0})}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    style={{ borderColor: '#66B933' }}
                  />
                </div>
                <button
                  onClick={addShuttlecock}
                  disabled={loadingStates.addShuttlecock}
                  className="w-full px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                  style={{ backgroundColor: '#66B933' }}
                >
                  {loadingStates.addShuttlecock ? 'Menambahkan...' : 'Tambah'}
                </button>
              </div>

              {/* Shuttlecocks List */}
              <div className="space-y-2">
                {shuttlecocks.map((shuttlecock, index) => (
                  <div key={index} className="bg-white dark:bg-gray-600 p-4 border rounded-lg shadow-sm flex items-center justify-between" style={{ borderColor: '#66B933' }}>
                    {editingShuttlecock?.name === shuttlecock.name ? (
                      <div className="flex-1 grid md:grid-cols-2 gap-2 mr-2">
                        <input
                          type="text"
                          value={editingShuttlecock.name}
                          onChange={(e) => setEditingShuttlecock({...editingShuttlecock, name: e.target.value})}
                          disabled={loadingStates.editShuttlecock}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ borderColor: '#66B933' }}
                        />
                        <input
                          type="number"
                          value={editingShuttlecock.priceperpiece}
                          onChange={(e) => setEditingShuttlecock({...editingShuttlecock, priceperpiece: parseInt(e.target.value) || 0})}
                          disabled={loadingStates.editShuttlecock}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ borderColor: '#66B933' }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-black dark:text-white">
                        <strong>{shuttlecock.name}</strong> - Rp {(shuttlecock.priceperpiece || 0).toLocaleString()}/biji
                      </div>
                    )}
                    <div className="flex gap-1">
                      {editingShuttlecock?.name === shuttlecock.name ? (
                        <>
                          <button
                            onClick={updateShuttlecock}
                            disabled={loadingStates.editShuttlecock}
                            className="px-2 py-1 text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                            style={{ backgroundColor: '#66B933' }}
                          >
                            {loadingStates.editShuttlecock ? 'Menyimpan...' : 'Simpan'}
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
                            disabled={loadingStates.deleteShuttlecock}
                            className="px-2 py-1 bg-black text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                          >
                            {loadingStates.deleteShuttlecock ? 'Menghapus...' : 'Hapus'}
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
              <h3 className="font-bold mb-4 text-black dark:text-white">🏦 Kelola Bank</h3>
              
              {/* Add New Bank */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 border rounded-lg mb-4" style={{ borderColor: '#66B933' }}>
                <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-200">Tambah Bank Baru</h4>
                <input
                  type="text"
                  placeholder="Nama Bank"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent mb-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  style={{ borderColor: '#66B933' }}
                />
                <button
                  onClick={addBank}
                  disabled={loadingStates.addBank}
                  className="w-full px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                  style={{ backgroundColor: '#66B933' }}
                >
                  {loadingStates.addBank ? 'Menambahkan...' : 'Tambah'}
                </button>
              </div>

              {/* Banks List */}
              <div className="grid md:grid-cols-3 gap-2">
                {bankOptions.map((bank, index) => (
                  <div key={index} className="bg-white dark:bg-gray-600 p-4 border rounded-lg shadow-sm flex items-center justify-between" style={{ borderColor: '#66B933' }}>
                    <span className="text-black dark:text-white font-medium">{bank}</span>
                    <button
                      onClick={() => deleteBank(bank)}
                      disabled={loadingStates.deleteBank}
                      className="px-2 py-1 bg-black text-white font-bold rounded text-xs hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                    >
                      {loadingStates.deleteBank ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
