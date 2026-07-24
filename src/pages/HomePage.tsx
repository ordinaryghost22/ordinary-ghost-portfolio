import {
  About,
  Contact,
  Hero,
  Projects,
  Resume,
  Skills,
} from '@/sections'

export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Resume />
      <Contact />
    </>
  )
}
