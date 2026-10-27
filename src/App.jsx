import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/AuthContext'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Gallery from './components/Gallery'
import FeaturedArticles from './components/FeaturedArticles'
import FeaturedTutorials from './components/FeaturedTutorials'
import Newsletter from './components/Newsletter'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Login from './components/Login'
import Signup from './components/Signup'
import Pricing from './components/Pricing'

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Gallery />
      <FeaturedArticles />
      <FeaturedTutorials />
      <Newsletter />
      <Contact />
      <Footer />
    </>
  )
}



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
