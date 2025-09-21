import './globals.css'
import ThemeToggle from './components/ThemeToggle'

export const metadata = {
  title: 'Badminton Calculator',
  description: 'Aplikasi perhitungan biaya badminton per orang',
  icons: {
    icon: '/images/logo.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  )
}
