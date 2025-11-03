import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import ContactPage from './pages/ContactPage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminUpload from './pages/AdminUpload';

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Navbar />
      <main id="scroll-root" className="min-h-screen pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* NESTED so listing and detail can’t clash */}
          <Route path="/properties">
            <Route index element={<PropertiesPage />} />          {/* #/properties */}
            <Route path=":slug" element={<PropertyDetailsPage />} /> {/* #/properties/:slug */}
          </Route>

          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin" element={<AdminUpload />} />
        </Routes>
      </main>
      <Footer />
    </HashRouter>
  );
}
