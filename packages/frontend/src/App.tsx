import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './components/Layout/Footer';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Layout/NavBar';
import { Toaster } from 'react-hot-toast';
const App: React.FC = () => {
  return (
    <>
      <Toaster position='bottom-right' />
      <BrowserRouter>
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