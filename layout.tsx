import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Бухал өвс — Би-гээ олох 30 хоногийн аялал",
  description: "Өөрийгөө сонсож, бодлоо ажиглаж, хүслээ нээх 30 хоногийн аялал."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}</body></html>;
}