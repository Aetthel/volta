import "./globals.css";

export const metadata = {
  title: "Volta Dashboard",
  description: "Gestión inteligente de citas por WhatsApp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
