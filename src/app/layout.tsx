import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZTF University Institute | Bertoua, Cameroon",
  description: "ZTF University Institute — A Christian university founded on excellence, faith, and service in Bertoua, Cameroon. Empowering World Innovators and Leaders for Global Impact.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
