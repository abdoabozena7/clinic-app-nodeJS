import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen p-6 relative" style={{ background: "#2bc0bf" }}>
      <Navbar />
      <div className="pt-20">{children}</div>
    </div>
  );
}