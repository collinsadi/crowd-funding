import Footer from "../(landing)/components/footer";
import Navbar from "./components/navbar";
import { Toaster } from "react-hot-toast";


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <Toaster/>
      {children}
      <Footer />
    </>
  );
}
