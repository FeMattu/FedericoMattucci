export const metadata = {
  title: 'Admin Login - Federico Mattucci',
  description: 'Accedi al pannello di amministrazione',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
