// Dynamic random internet photography for puzzle assembly
// Selected freshly on each page load from curated web photographs

export const CURATED_INTERNET_ARTWORKS = [
  {
    id: "mountain_lake",
    title: "Alpine Lake Reflection",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    photographer: "Bailey Zindel",
  },
  {
    id: "norway_fjord",
    title: "Lofoten Sunset Fjord",
    url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
    photographer: "Stephan Seeber",
  },
  {
    id: "misty_forest",
    title: "Misty Pacific Redwoods",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    photographer: "Sebastian Unrau",
  },
  {
    id: "swiss_peaks",
    title: "Matterhorn Golden Horizon",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    photographer: "Kalem Daniels",
  },
  {
    id: "kyoto_sanctuary",
    title: "Zen Temple Arches",
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    photographer: "Su San Lee",
  },
  {
    id: "desert_dunes",
    title: "Sahara Golden Crests",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    photographer: "Jeremy Bishop",
  },
  {
    id: "iceland_waterfall",
    title: "Skógafoss Rainbow Cascade",
    url: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80",
    photographer: "Robert Lukeman",
  },
  {
    id: "aurora_borealis",
    title: "Tromsø Northern Lights",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80",
    photographer: "Vincent Guth",
  },
  {
    id: "architectural_geometry",
    title: "Modern Minimalist Curves",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    photographer: "Alex Wong",
  },
];

export function getRandomInternetArtwork(): { id: string; title: string; url: string; photographer: string } {
  // Pick a fresh random internet image on every page load
  const index = Math.floor(Math.random() * CURATED_INTERNET_ARTWORKS.length);
  return CURATED_INTERNET_ARTWORKS[index];
}
