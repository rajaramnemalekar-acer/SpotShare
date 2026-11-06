import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/Listing.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rajaramnemalekar_db_user:Spotshare123@cluster0.3oknqu1.mongodb.net/spotshare?retryWrites=true&w=majority'

const spots60 = [
  // --- 1. STUDIO (10 Spots) ---
  {
    title: "Kasal Highway Creative Co-Work Studio",
    location: "Kasal, Sindhudurg, MH",
    category: "Studio",
    description: "A sleek modern co-working and content creation studio right off the Kasal highway with professional lighting rigs.",
    pricePerHour: 60,
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
  },
  {
    title: "Malvan Coastal Daylight Photo Studio",
    location: "Malvan, Sindhudurg, MH",
    category: "Studio",
    description: "Soaked in natural sunlight overlooking the Arabian sea breeze, ideal for fashion lookbooks and portraits.",
    pricePerHour: 85,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
  },
  {
    title: "Sawantwadi Artisanal Acoustic Studio",
    location: "Sawantwadi, Sindhudurg, MH",
    category: "Studio",
    description: "Fully soundproofed professional music recording and podcast production studio with vintage wood finish.",
    pricePerHour: 95,
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800"
  },
  {
    title: "Kudal Minimalist White Cyclorama Studio",
    location: "Kudal, Sindhudurg, MH",
    category: "Studio",
    description: "Professional L-shaped infinity cove cyc wall equipped with grid lighting and high-speed fiber internet.",
    pricePerHour: 110,
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800"
  },
  {
    title: "Vengurla Harbour Video Production Lab",
    location: "Vengurla, Sindhudurg, MH",
    category: "Studio",
    description: "Spacious multi-set video editing and green screen production stage near Vengurla port.",
    pricePerHour: 90,
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800"
  },
  {
    title: "Devgad Sunset Creator Studio",
    location: "Devgad, Sindhudurg, MH",
    category: "Studio",
    description: "An aesthetic content creator loft with modular furniture and panoramic sea views.",
    pricePerHour: 75,
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800"
  },
  {
    title: "Amboli Misty Pine Studio",
    location: "Amboli, Sindhudurg, MH",
    category: "Studio",
    description: "High-altitude glasshouse studio surrounded by misty pine forests for serene cinematic shoots.",
    pricePerHour: 120,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
  },
  {
    title: "Oros Urban Podcast Suite",
    location: "Oros, Sindhudurg, MH",
    category: "Studio",
    description: "Acoustic-treated interview recording booth equipped with Shure mics and 4K cameras.",
    pricePerHour: 65,
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"
  },
  {
    title: "Kankavli Executive Photography Loft",
    location: "Kankavli, Sindhudurg, MH",
    category: "Studio",
    description: "Industrial brick loft with high ceilings, strobe lighting, and client makeup stations.",
    pricePerHour: 80,
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800"
  },
  {
    title: "Tarkarli Estuary Art Studio",
    location: "Tarkarli, Sindhudurg, MH",
    category: "Studio",
    description: "Bohemian artistic workspace right on the backwaters for painters and ceramic workshops.",
    pricePerHour: 70,
    imageUrl: "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800"
  },

  // --- 2. EVENT (10 Spots) ---
  {
    title: "Tarkarli Grand Beachside Celebration Lawns",
    location: "Tarkarli, Sindhudurg, MH",
    category: "Event",
    description: "Expansive white-sand beachfront venue perfect for destination weddings, cocktail nights, and galas.",
    pricePerHour: 250,
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"
  },
  {
    title: "Malvan Heritage Banquet Hall",
    location: "Malvan, Sindhudurg, MH",
    category: "Event",
    description: "Air-conditioned royal banquet hall featuring crystal chandeliers and traditional Konkani architecture.",
    pricePerHour: 180,
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"
  },
  {
    title: "Sawantwadi Palace Courtyard Event Space",
    location: "Sawantwadi, Sindhudurg, MH",
    category: "Event",
    description: "Regal historic courtyard venue surrounded by royal gardens and classic fountains.",
    pricePerHour: 220,
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"
  },
  {
    title: "Vengurla Lighthouse Cliffside Pavilion",
    location: "Vengurla, Sindhudurg, MH",
    category: "Event",
    description: "Breathtaking clifftop event platform overlooking the crashing waves of the Arabian Sea.",
    pricePerHour: 200,
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800"
  },
  {
    title: "Kudal Royal Palm Banquet",
    location: "Kudal, Sindhudurg, MH",
    category: "Event",
    description: "Modern banquet and reception hall with state-of-the-art surround sound and mood lighting.",
    pricePerHour: 160,
    imageUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800"
  },
  {
    title: "Devgad Mango Orchards Party Grounds",
    location: "Devgad, Sindhudurg, MH",
    category: "Event",
    description: "Open-air farm celebration arena nestled under lush Alphonso mango trees with fairy lights.",
    pricePerHour: 140,
    imageUrl: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800"
  },
  {
    title: "Amboli Waterfall View Party Deck",
    location: "Amboli, Sindhudurg, MH",
    category: "Event",
    description: "Scenic terrace party venue overlooking misty mountain valleys and cascading waterfalls.",
    pricePerHour: 190,
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"
  },
  {
    title: "Oros Civic Convention Center",
    location: "Oros, Sindhudurg, MH",
    category: "Event",
    description: "Spacious district convention venue suited for exhibitions, trade shows, and large gatherings.",
    pricePerHour: 150,
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800"
  },
  {
    title: "Kankavli Celebration Banquet",
    location: "Kankavli, Sindhudurg, MH",
    category: "Event",
    description: "Elegant indoor function hall with customizable seating layouts and catering kitchen.",
    pricePerHour: 130,
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
  },
  {
    title: "Kasal Highway Party Lawn",
    location: "Kasal, Sindhudurg, MH",
    category: "Event",
    description: "Accessible open-air celebration lawn with ample parking and modern stage setup.",
    pricePerHour: 135,
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"
  },

  // --- 3. MEETING (10 Spots) ---
  {
    title: "Oros Central District Meeting Hub",
    location: "Oros, Sindhudurg, MH",
    category: "Meeting",
    description: "Executive boardroom equipped with 4K display screens, video conferencing, and ergonomic seating.",
    pricePerHour: 75,
    imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
  },
  {
    title: "Kasal Business Conference Center",
    location: "Kasal, Sindhudurg, MH",
    category: "Meeting",
    description: "Professional seminar room designed for corporate workshops, training sessions, and pitch meetings.",
    pricePerHour: 85,
    imageUrl: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800"
  },
  {
    title: "Kudal Tech Park Boardroom",
    location: "Kudal, Sindhudurg, MH",
    category: "Meeting",
    description: "Modern glass-walled meeting space with high-speed fiber internet and whiteboards.",
    pricePerHour: 70,
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800"
  },
  {
    title: "Sawantwadi Heritage Executive Lounge",
    location: "Sawantwadi, Sindhudurg, MH",
    category: "Meeting",
    description: "Quiet, sophisticated discussion parlor adorned with local lacquerware and antique furnishings.",
    pricePerHour: 90,
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
  },
  {
    title: "Malvan Seaside Collaboration Room",
    location: "Malvan, Sindhudurg, MH",
    category: "Meeting",
    description: "Inspirational brainstorming room overlooking the harbor with modular brainstorming tables.",
    pricePerHour: 80,
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800"
  },
  {
    title: "Vengurla Port Seminar Hall",
    location: "Vengurla, Sindhudurg, MH",
    category: "Meeting",
    description: "Fully air-conditioned seminar theater with tiered seating and projection systems.",
    pricePerHour: 95,
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800"
  },
  {
    title: "Devgad Coastal Strategy Room",
    location: "Devgad, Sindhudurg, MH",
    category: "Meeting",
    description: "Private executive meeting retreat with panoramic ocean views to spark creative strategy.",
    pricePerHour: 85,
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800"
  },
  {
    title: "Amboli Peak Workshop Lounge",
    location: "Amboli, Sindhudurg, MH",
    category: "Meeting",
    description: "Cozy mountain-view retreat ideal for corporate offsite meetings and leadership planning.",
    pricePerHour: 100,
    imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800"
  },
  {
    title: "Kankavli Town Council Room",
    location: "Kankavli, Sindhudurg, MH",
    category: "Meeting",
    description: "Spacious modular conference venue with sound recording capabilities.",
    pricePerHour: 60,
    imageUrl: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800"
  },
  {
    title: "Tarkarli Estuary Conference Den",
    location: "Tarkarli, Sindhudurg, MH",
    category: "Meeting",
    description: "Relaxed resort-style meeting space right on the waters of the Karli river.",
    pricePerHour: 90,
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"
  },

  // --- 4. OUTDOOR (10 Spots) ---
  {
    title: "Amboli Valley Pine Amphitheater",
    location: "Amboli, Sindhudurg, MH",
    category: "Outdoor",
    description: "Natural tiered outdoor amphitheater carved into the misty hills of Amboli ghats.",
    pricePerHour: 130,
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
  },
  {
    title: "Tarkarli Golden Sand Dune Grounds",
    location: "Tarkarli, Sindhudurg, MH",
    category: "Outdoor",
    description: "Vast pristine coastal sand stretch perfect for outdoor brand activations and music jams.",
    pricePerHour: 150,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
  },
  {
    title: "Sindhudurg Fort Island View Deck",
    location: "Malvan, Sindhudurg, MH",
    category: "Outdoor",
    description: "Historic rocky shoreline viewing terrace with direct views of the majestic Sindhudurg sea fort.",
    pricePerHour: 140,
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
  },
  {
    title: "Devgad Cliffside Sunset Point",
    location: "Devgad, Sindhudurg, MH",
    category: "Outdoor",
    description: "Rugged basalt cliff ledge overlooking endless ocean sunsets for cinematic outdoor shoots.",
    pricePerHour: 110,
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800"
  },
  {
    title: "Vengurla Turtle Beach Reserve",
    location: "Vengurla, Sindhudurg, MH",
    category: "Outdoor",
    description: "Secluded pristine sandy cove bordered by casuarina groves and gentle tide pools.",
    pricePerHour: 120,
    imageUrl: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800"
  },
  {
    title: "Sawantwadi Bamboo Grove Meadow",
    location: "Sawantwadi, Sindhudurg, MH",
    category: "Outdoor",
    description: "Enchanting natural bamboo forest clearing with dappled sunlight and tranquil ambiance.",
    pricePerHour: 95,
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800"
  },
  {
    title: "Kudal Riverbank Green Meadow",
    location: "Kudal, Sindhudurg, MH",
    category: "Outdoor",
    description: "Expansive grassy riverfront property shaded by ancient banyan trees.",
    pricePerHour: 85,
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
  },
  {
    title: "Kankavli Hilltop Sunrise Plateau",
    location: "Kankavli, Sindhudurg, MH",
    category: "Outdoor",
    description: "High plateau offering 360-degree panoramic views of the Western Ghats sunrise.",
    pricePerHour: 90,
    imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800"
  },
  {
    title: "Kasal Eco Farm Adventure Grounds",
    location: "Kasal, Sindhudurg, MH",
    category: "Outdoor",
    description: "Organic spice and fruit farm with open lawns for outdoor team building and workshops.",
    pricePerHour: 75,
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800"
  },
  {
    title: "Oros Botanical Garden Lawn",
    location: "Oros, Sindhudurg, MH",
    category: "Outdoor",
    description: "Landscaped botanical garden lawn featuring exotic tropical flora and paved walkways.",
    pricePerHour: 80,
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800"
  },

  // --- 5. VILLA (10 Spots) ---
  {
    title: "Kudal Riverside Mango Orchard Villa",
    location: "Kudal, Sindhudurg, MH",
    category: "Villa",
    description: "Luxurious heritage villa surrounded by 10 acres of organic mango trees with a private infinity pool.",
    pricePerHour: 175,
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"
  },
  {
    title: "Kankavli Modern Architectural Villa",
    location: "Kankavli, Sindhudurg, MH",
    category: "Villa",
    description: "A stunning minimalist glass-and-concrete designer villa with sunken lounge and wrap-around deck.",
    pricePerHour: 160,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
  },
  {
    title: "Malvan Coastal Luxury Villa",
    location: "Malvan, Sindhudurg, MH",
    category: "Villa",
    description: "Portuguese-style luxury sea-facing villa with private beach access and antique wooden interiors.",
    pricePerHour: 210,
    imageUrl: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800"
  },
  {
    title: "Amboli Hilltop Mist Villa",
    location: "Amboli, Sindhudurg, MH",
    category: "Villa",
    description: "Alpine-inspired wooden chalet villa nestled amidst foggy mountain ridges with a stone fireplace.",
    pricePerHour: 190,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
  },
  {
    title: "Tarkarli Backwater Luxury Estate",
    location: "Tarkarli, Sindhudurg, MH",
    category: "Villa",
    description: "Serene waterfront villa featuring private boat dock, sprawling lawns, and luxury pool.",
    pricePerHour: 230,
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
  },
  {
    title: "Vengurla Cliffside Horizon Villa",
    location: "Vengurla, Sindhudurg, MH",
    category: "Villa",
    description: "Cliff-edge luxury mansion with floor-to-ceiling glass windows overlooking the infinite sea.",
    pricePerHour: 220,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
  },
  {
    title: "Sawantwadi Royal Garden Villa",
    location: "Sawantwadi, Sindhudurg, MH",
    category: "Villa",
    description: "Heritage-restored luxury estate featuring hand-carved teak pillars and tranquil lily ponds.",
    pricePerHour: 185,
    imageUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800"
  },
  {
    title: "Devgad Sunset Horizon Villa",
    location: "Devgad, Sindhudurg, MH",
    category: "Villa",
    description: "Contemporary cliffside villa with infinity pool blending seamlessly into the Arabian Sea horizon.",
    pricePerHour: 195,
    imageUrl: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800"
  },
  {
    title: "Kasal Highway Luxury Retreat Villa",
    location: "Kasal, Sindhudurg, MH",
    category: "Villa",
    description: "Exclusive gated luxury villa with private tennis court, pool, and expansive party lawns.",
    pricePerHour: 150,
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"
  },
  {
    title: "Oros Valley Palm Villa",
    location: "Oros, Sindhudurg, MH",
    category: "Villa",
    description: "Tropical oasis villa featuring open-to-sky courtyards and lush palm-fringed swimming pool.",
    pricePerHour: 140,
    imageUrl: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800"
  },

  // --- 6. SOUNDSTAGE (10 Spots) ---
  {
    title: "Kudal Advanced Film Soundstage",
    location: "Kudal, Sindhudurg, MH",
    category: "Soundstage",
    description: "Massive 5,000 sq.ft. clear-span soundstage with motorized lighting grid, catwalks, and green room.",
    pricePerHour: 250,
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800"
  },
  {
    title: "Malvan Cinematic FX Soundstage",
    location: "Malvan, Sindhudurg, MH",
    category: "Soundstage",
    description: "Fully sound-insulated production stage equipped with a 180-degree curved LED virtual production wall.",
    pricePerHour: 300,
    imageUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800"
  },
  {
    title: "Sawantwadi Commercial Soundstage",
    location: "Sawantwadi, Sindhudurg, MH",
    category: "Soundstage",
    description: "Professional multi-purpose studio stage optimized for TV commercial shoots and music videos.",
    pricePerHour: 220,
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800"
  },
  {
    title: "Vengurla Broadcast Stage Alpha",
    location: "Vengurla, Sindhudurg, MH",
    category: "Soundstage",
    description: "High-spec television broadcast and live streaming stage with control room integration.",
    pricePerHour: 210,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"
  },
  {
    title: "Kasal Highway Mega Soundstage",
    location: "Kasal, Sindhudurg, MH",
    category: "Soundstage",
    description: "Industrial-grade sound stage with heavy vehicle access, makeup trailers, and power generators.",
    pricePerHour: 240,
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800"
  },
  {
    title: "Devgad Ocean View Soundstage",
    location: "Devgad, Sindhudurg, MH",
    category: "Soundstage",
    description: "Coastal sound stage combining indoor controlled acoustics with outdoor sea backdrops.",
    pricePerHour: 200,
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800"
  },
  {
    title: "Amboli Mountain Soundstage",
    location: "Amboli, Sindhudurg, MH",
    category: "Soundstage",
    description: "High-altitude enclosed studio stage designed for weather-controlled cinematic shoots.",
    pricePerHour: 230,
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"
  },
  {
    title: "Oros Production Stage Beta",
    location: "Oros, Sindhudurg, MH",
    category: "Soundstage",
    description: "Modern soundstage facility featuring acoustic wall panels, grid lighting, and prop storage.",
    pricePerHour: 180,
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800"
  },
  {
    title: "Kankavli Prime Soundstage",
    location: "Kankavli, Sindhudurg, MH",
    category: "Soundstage",
    description: "Fully equipped sound stage with dedicated editing suites and client viewing galleries.",
    pricePerHour: 190,
    imageUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800"
  },
  {
    title: "Tarkarli Backwater Soundstage",
    location: "Tarkarli, Sindhudurg, MH",
    category: "Soundstage",
    description: "Scenic studio soundstage located right on the backwaters for specialized aquatic and land shoots.",
    pricePerHour: 260,
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for 60-spot seeding...');
    
    await Listing.deleteMany({});
    console.log('Cleared existing listings.');

    await Listing.insertMany(spots60);
    console.log('Successfully added all 60 spots (10 for each of the 6 categories with full descriptions)!');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();