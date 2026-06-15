import { Outfit } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import Provider from "./provider";
import NavbarWrapper from "@/components/NavbarWrapper";
import "katex/dist/katex.min.css"; // Add KaTeX styles globally
import "./styles.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "NoteAG",
  description: "Your intelligent note-taking companion",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased bg-black text-white`}>
          <Provider>
            <NavbarWrapper />
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}

