import BgDots from './components/BgDots';
import Sprite from './components/Sprite';
import Header from './components/Header';
import Hero from './components/Hero';
import Band from './components/Band';
import Services from './components/Services';
import About from './components/About';
import Industries from './components/Industries';
import Cases from './components/Cases';
import Collaborators from './components/Collaborators';
import Contact from './components/Contact';
import Footer from './components/Footer';
import useScrollFx from './components/useScrollFx';

export default function App() {
  useScrollFx();

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <BgDots />
      <Sprite />
      <Header />
      <main>
        <Hero />
        <Band />
        <Services />
        <About />
        <Industries />
        <Cases />
        <div className="wrap"><hr className="sep" /></div>
        <Collaborators />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
