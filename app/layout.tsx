import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
