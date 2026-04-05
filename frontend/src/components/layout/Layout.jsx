import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-white">

      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="pt-20 md:ml-64 px-4 md:px-6 w-full min-h-screen bg-white">
        <div className="max-w-7xl mx-auto w-full bg-white">
          {children}
        </div>
      </main>

    </div>
  );
}