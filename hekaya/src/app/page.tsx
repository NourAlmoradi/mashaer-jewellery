import {
  Hero,
  TrustBadges,
  CollectionShowcase,
  FeaturedProducts,
  QRBanner,
  StoryStrip,
  Testimonials,
  HomeFinalCta,
} from "@/components/home/HomeSections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <CollectionShowcase />
      <FeaturedProducts />
      <QRBanner />
      <StoryStrip />
      <Testimonials />
      <HomeFinalCta />
    </>
  );
}
