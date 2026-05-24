import {
  Hero,
  TrustBadges,
  CollectionShowcase,
  FeaturedProducts,
  QRBanner,
  StoryStrip,
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
      <HomeFinalCta />
    </>
  );
}
