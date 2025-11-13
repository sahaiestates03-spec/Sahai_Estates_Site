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
import NewLaunch from "./pages/NewLaunch";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
// TEMP DEBUG — remove after testing
console.info("[ENV CHECK] VITE_NEWLAUNCH_SHEET_CSV =", import.meta.env.VITE_NEWLAUNCH_SHEET_CSV);
console.info("[ENV CHECK] VITE_LISTINGS_SHEET_CSV =", import.meta.env.VITE_LISTINGS_SHEET_CSV);
console.info("[ENV CHECK] VITE_SHEET_ID =", import.meta.env.VITE_SHEET_ID);
console.info("[ENV CHECK] VITE_SHEET_GID =", import.meta.env.VITE_SHEET_GID);
console.info("[ENV CHECK] VITE_NEWLAUNCH_EXEC =", import.meta.env.VITE_NEWLAUNCH_EXEC);
console.info("[ENV CHECK] VITE_LEADS_ENDPOINT =", import.meta.env.VITE_LEADS_ENDPOINT);


export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Navbar />

      {/* ✅ Removed top padding */}
      <main id="scroll-root" className="min-h-screen pt-0">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/properties">
            <Route index element={<PropertiesPage />} />
            <Route path=":slug" element={<PropertyDetailsPage />} />
          </Route>

          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin" element={<AdminUpload />} />
          <Route path="/new-launch" element={<NewLaunch />} />
          <Route path="/properties/:slug" element={<PropertyDetailsPage />} />
        </Routes>
      </main>

      <Footer />
    </HashRouter>
  );
}
