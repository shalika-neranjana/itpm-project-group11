import CTA from '../components/landing/CTA'
import Features from '../components/landing/Features'
import Footer from '../components/landing/Footer'
import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import Navbar from '../components/landing/Navbar'
import Stats from '../components/landing/Stats'
import Testimonials from '../components/landing/Testimonials'

function Home() {
  return (
    <div
      className="min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat text-gray-900"
      style={{ backgroundImage: "url('/authbackgound.jpg')" }}
    >
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stats />
        <Testimonials />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default Home
