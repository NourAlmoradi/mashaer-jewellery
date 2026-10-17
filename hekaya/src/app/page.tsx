import {
  Hero,
  TrustBadges,
  CollectionShowcase,
  FeaturedProducts,
  QRBanner,
  StoryStrip,
  HomeFinalCta,
} from "@/components/home/HomeSections";
import { BespokeBridge, BespokeInvite } from "@/components/bespoke/BespokeInvite";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <CollectionShowcase />
      <FeaturedProducts />
      <BespokeInvite />
      <BespokeBridge />
      <QRBanner />
      <StoryStrip />
      <HomeFinalCta />
    </>
  );
}
