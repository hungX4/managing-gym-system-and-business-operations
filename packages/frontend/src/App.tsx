import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './components/Layout/Footer';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Layout/NavBar';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Thanh điều hướng luôn nằm ở trên cùng */}
      <Navbar />

      {/* Khu vực nội dung chính sẽ thay đổi tuỳ theo URL */}
      <main className="min-h-screen bg-gray-50">
        <AppRoutes />
      </main>

      {/* Chân trang luôn nằm ở dưới */}
      <Footer />
    </BrowserRouter>
  );
};

export default App;