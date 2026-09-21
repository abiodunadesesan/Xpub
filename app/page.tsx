import { AboutSection } from "@/components/about-section";
import { BackgroundMusic } from "@/components/background-music";
import { BlogSection } from "@/components/blog-section";
import { CustomCursor } from "@/components/custom-cursor";
import { ExperienceSection } from "@/components/experience-section";
import { GallerySection } from "@/components/gallery-section";
import { HeroSection } from "@/components/hero-section";
import { MenuSection } from "@/components/menu-section";
import { MusicSection } from "@/components/music-section";
import { ReviewsSection } from "@/components/reviews-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteLoader } from "@/components/site-loader";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Starfield } from "@/components/starfield";
import { VisitSection } from "@/components/visit-section";
import { AudioPlayerProvider } from "@/lib/audio-player";
import { VenueMediaProvider } from "@/lib/venue-media";

export default function Home() {
  return (
    <AudioPlayerProvider>
      <VenueMediaProvider>
        <SmoothScroll>
          <SiteLoader />
          <CustomCursor />
          <BackgroundMusic />
          <Starfield />
          <SiteHeader />
          <main className="relative z-10 flex-1">
            <HeroSection />
            <AboutSection />
            <ExperienceSection />
            <MenuSection />
            <GallerySection />
            <MusicSection />
            <BlogSection />
            <ReviewsSection />
            <VisitSection />
          </main>
          <SiteFooter />
        </SmoothScroll>
      </VenueMediaProvider>
    </AudioPlayerProvider>
  );
}
