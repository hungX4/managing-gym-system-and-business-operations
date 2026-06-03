import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './components/Layout/Footer';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Layout/NavBar';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
const App: React.FC = () => {
  return (
    <>
      <Toaster position='bottom-right' />
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />

        <main className="min-h-screen bg-gray-50">
          <AppRoutes />
        </main>


        <Footer />
      </BrowserRouter>
    </>
  );
};

export default App;