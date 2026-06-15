"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Hide navbar on dashboard routes (dashboard has its own terminal chrome)
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return <Navbar />;
}
