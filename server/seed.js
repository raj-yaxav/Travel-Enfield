import 'dotenv/config';
import mongoose from 'mongoose';
import { Destination, Trip, Category, Blog, Page } from './models.js';

const img = slug => `/images/destinations/${slug}.jpg`;
const commonFaq = name => [
  { question: `What is the best time to visit ${name}?`, answer: `The ideal season depends on the experiences you prefer. Our trip experts recommend dates with comfortable weather and reliable local access.` },
  { question: `Can I customise my ${name} trip?`, answer: 'Yes. Dates, stay category, activities and transfers can be customised for private groups, couples and families.' },
  { question: 'Are solo travellers welcome?', answer: 'Absolutely. Our fixed departures are designed for solo travellers as well as friends and couples.' },
];
const destinations = [
  ['Ladakh','ladakh','domestic',19499,'May to September','High passes, blue lakes and unforgettable Himalayan roads',['Pangong Lake','Nubra Valley','Khardung La'],['Bike through mountain passes','Visit monasteries','Camp near Pangong']],
  ['Spiti Valley','spiti','domestic',17999,'May to October','Ancient monasteries and stark high-altitude landscapes',['Kaza','Key Monastery','Chandratal Lake'],['Drive the full circuit','Stargaze in remote villages','Explore fossil villages']],
  ['Manali','manali','domestic',9499,'October to June','A quick Himalayan escape for snow, cafés and adventure',['Solang Valley','Atal Tunnel','Old Manali'],['Try snow activities','Explore local cafés','Visit mountain villages']],
  ['Kerala','kerala','domestic',14999,'September to March','Backwaters, tea gardens and a slower tropical rhythm',['Munnar','Alleppey','Varkala'],['Stay on a houseboat','Walk through tea estates','Watch a coastal sunset']],
  ['Meghalaya','meghalaya','domestic',15499,'October to April','Living root bridges, clear rivers and rain-washed forests',['Shillong','Dawki','Cherrapunji'],['Walk a living root bridge','Boat on the Umngot','Chase waterfalls']],
  ['Bali','bali','international',44999,'April to October','Temples, island adventures and vibrant tropical culture',['Ubud','Nusa Penida','Uluwatu'],['Sunrise at Mount Batur','Island hopping','Explore temples']],
  ['Thailand','thailand','international',32999,'November to March','Tropical islands, street food and legendary nightlife',['Bangkok','Krabi','Phuket'],['Long-tail boat tour','Explore night markets','Visit island beaches']],
  ['Nepal','nepal','international',29999,'March to May, September to November','Himalayan views, heritage towns and welcoming mountain culture',['Kathmandu','Pokhara','Annapurna'],['Watch an Himalayan sunrise','Explore heritage squares','Walk a mountain trail']],
].map(([name,slug,category,startingPrice,bestTime,tagline,highlights,thingsToDo]) => ({ name,slug,category,startingPrice,bestTime,tagline,summary:`Discover ${name} with transparent inclusions, handpicked stays and experienced TravelEnfield trip captains.`,image:img(slug),highlights,thingsToDo,travelTips:['Carry a valid government ID','Keep weather-ready layers','Respect local culture and ecology'],faq:commonFaq(name) }));

const itinerary = names => names.map((title, i) => ({ day:i+1,title,details:[`Experience ${title} with your trip captain.`, 'Meals, transfers and stay follow the inclusions listed below.'] }));
const trips = [
  {title:'Leh Ladakh Bike Trip',slug:'leh-ladakh-bike-trip',destinationSlug:'ladakh',categories:['all','upcoming','domestic','bike-trips'],image:'/images/categories/bike-trips.jpg',duration:'6 nights / 7 days',nights:6,price:19499,oldPrice:24999,discount:'22% Off',badge:'Free Goodies',summary:'Ride across iconic high passes and remote valleys on a supported Himalayan motorcycle journey.',groupSize:'12–20 travellers',pickup:'Leh Airport',dates:['Aug 15','Aug 22','Sep 5','Sep 12'],itinerary:itinerary(['Arrival and acclimatisation in Leh','Leh local exploration','Leh to Nubra Valley','Nubra to Pangong Lake','Pangong to Leh','Buffer and celebration','Departure']),featured:true},
  {title:'Spiti Valley Road Trip',slug:'spiti-valley-road-trip',destinationSlug:'spiti',categories:['all','upcoming','domestic','backpacking-trips'],image:img('spiti'),duration:'7 nights / 8 days',nights:7,price:17999,oldPrice:22999,discount:'22% Off',badge:'Bestseller',summary:'A high-altitude road trip through monasteries, villages and dramatic cold-desert landscapes.',groupSize:'12–18 travellers',pickup:'Delhi',dates:['Aug 20','Sep 1','Sep 15','Oct 2'],itinerary:itinerary(['Delhi to Shimla','Shimla to Chitkul','Chitkul to Kalpa','Kalpa to Kaza','Kaza local circuit','Kaza to Chandratal','Chandratal to Manali','Departure']),featured:true},
  {title:'Bali Adventure Tour',slug:'bali-adventure-tour',destinationSlug:'bali',categories:['all','upcoming','international'],image:img('bali'),duration:'5 nights / 6 days',nights:5,price:44999,oldPrice:54999,discount:'18% Off',badge:'Free Goodies',summary:'A balanced Bali escape with temples, waterfalls, island views and social evenings.',groupSize:'10–18 travellers',pickup:'Denpasar Airport',dates:['Sep 10','Sep 24','Oct 8','Oct 22'],itinerary:itinerary(['Arrival in Bali','Ubud culture trail','Nusa Penida day trip','Mount Batur sunrise','Uluwatu and leisure','Departure']),featured:true},
  {title:'Thailand Beach Getaway',slug:'thailand-beach-getaway',destinationSlug:'thailand',categories:['all','upcoming','international'],image:img('thailand'),duration:'5 nights / 6 days',nights:5,price:32999,oldPrice:39999,discount:'18% Off',badge:'Trending',summary:'Island scenery, bustling markets and a fun group itinerary across Thailand.',groupSize:'10–18 travellers',pickup:'Bangkok Airport',dates:['Sep 5','Sep 19','Oct 3','Oct 17'],itinerary:itinerary(['Bangkok arrival','Bangkok city highlights','Fly to Krabi','Island hopping','Leisure and night market','Departure'])},
  {title:'Manali Snow Adventure',slug:'manali-snow-adventure',destinationSlug:'manali',categories:['all','upcoming','domestic','weekend'],image:img('manali'),duration:'3 nights / 4 days',nights:3,price:9499,oldPrice:12999,discount:'27% Off',badge:'Weekend Pick',summary:'A compact mountain break with snow activities, cafés and scenic drives.',groupSize:'12–24 travellers',pickup:'Delhi',dates:['Aug 10','Aug 17','Aug 24','Aug 31'],itinerary:itinerary(['Delhi to Manali','Solang Valley adventure','Old Manali and local sights','Return to Delhi'])},
  {title:'Meghalaya Explorer',slug:'meghalaya-explorer',destinationSlug:'meghalaya',categories:['all','upcoming','domestic','backpacking-trips'],image:img('meghalaya'),duration:'5 nights / 6 days',nights:5,price:15499,oldPrice:19999,discount:'23% Off',badge:'New',summary:'Clear rivers, forest trails and living root bridges in India’s northeast.',groupSize:'10–18 travellers',pickup:'Guwahati Airport',dates:['Sep 8','Sep 22','Oct 6','Oct 20'],itinerary:itinerary(['Guwahati to Shillong','Cherrapunji waterfalls','Living root bridge trek','Dawki and Mawlynnong','Shillong local day','Departure'])},
].map(t => ({...t,inclusions:['Comfortable stays on sharing basis','Transfers as per itinerary','Trip captain throughout the journey','Experiences specifically mentioned'],exclusions:['Flights unless explicitly mentioned','Personal expenses and tips','Meals not listed in the itinerary','GST and applicable taxes'],notes:['Carry a valid photo ID.','Final schedule may change due to weather or local conditions.']}));

const categoryData = [
  ['All Trips','trips','Explore all TravelEnfield trips','Compare curated departures across India and international destinations.','/images/hero.jpg','Find your next story'],
  ['Upcoming Group Trips','upcoming-trips','Upcoming group departures','Meet like-minded travellers on fixed-date journeys led by experienced captains.','/images/social-banner.jpg','Fixed dates, effortless planning'],
  ['Domestic Trips','domestic-trips','Explore India','From Himalayan roads to tropical backwaters, discover curated journeys closer to home.','/images/destinations/ladakh.jpg','Journeys across India'],
  ['International Trips','international-trips','Travel beyond borders','Original international itineraries with clear inclusions and on-trip support.','/images/destinations/bali.jpg','Beyond borders'],
  ['Weekend Trips','weekend-trips','Make the weekend count','Short, high-energy escapes designed around convenient departures.','/images/destinations/manali.jpg','Quick escapes'],
  ['Deals','deals','Current trip deals','Limited-period prices and early-bird benefits on selected departures.','/images/destinations/thailand.jpg','Limited-period benefits'],
  ['Bike Trips','bike-trips','Ride farther. Feel more.','Supported motorcycle journeys through Ladakh and India’s most dramatic open roads.','/images/categories/bike-trips.jpg','Two wheels, one unforgettable road'],
  ['Backpacking Trips','backpacking-trips','Backpacking trips for curious people','Social, immersive routes with thoughtful stays and experienced trip captains.','/images/destinations/spiti.jpg','Travel light, connect deeply'],
  ['Trekking Trips','trekking-trips','Trails worth earning','High-altitude landscapes, expert-led routes and small-group mountain experiences.','/images/destinations/nepal.jpg','Walk into the wild'],
].map(([name,slug,title,description,image,eyebrow]) => ({name,slug,title,description,image,eyebrow,filters:['destination','budget','duration','date']}));

const blogs = [
  ['Best Time to Visit Ladakh','best-time-to-visit-ladakh','Plan around open roads, comfortable weather and the experiences you value most.','ladakh','Destination Guide'],
  ['Places to Visit in Spiti Valley','places-to-visit-in-spiti','A practical guide to monasteries, villages, lakes and high-altitude viewpoints.','spiti','Places to Visit'],
  ['Things to Do in Bali','things-to-do-in-bali','Temples, sunrise hikes, island trips and local cultural experiences.','bali','Things to Do'],
  ['Meghalaya Travel Guide','meghalaya-travel-guide','Everything to know before exploring root bridges, rivers and waterfalls.','meghalaya','Travel Guide'],
].map(([title,slug,excerpt,imageSlug,category],i) => ({title,slug,excerpt,image:img(imageSlug),category,author:'TravelEnfield Editorial',readTime:`${5+i} min read`,publishedAt:new Date(2026,6,i+1),sections:[{heading:'Why this journey deserves a place on your list',body:excerpt+' TravelEnfield recommends planning with enough flexibility for weather, local conditions and spontaneous discoveries.'},{heading:'Planning essentials',body:'Confirm your dates early, pack for the season, keep digital copies of your documents and review package inclusions before booking.'},{heading:'Travel responsibly',body:'Support local businesses, avoid single-use plastic and follow the guidance of local hosts and trip captains.'}]}));

const pageData = [
  ['about-us','About TravelEnfield','Our story','Trips that feel unforgettable, not complicated.','We design transparent, social and well-supported journeys for modern Indian travellers.'],
  ['contact-us','Contact TravelEnfield','Let’s plan your journey','Talk to a real travel expert.','Call, WhatsApp or send an enquiry and our team will help you choose the right trip.'],
  ['reviews','Reviews & Community','Traveller stories','Real journeys. Real connections.','Our community is built around safe, memorable trips and the friendships created along the way.'],
  ['faq','Frequently Asked Questions','Need help?','Clear answers before you book.','Find information about payments, departures, cancellations, stays and trip support.'],
  ['privacy-policy','Privacy Policy','Legal','How we handle your information.','We collect only the information needed to operate enquiries, bookings and account services responsibly.'],
  ['terms-and-conditions','Terms and Conditions','Legal','Terms for using TravelEnfield.','These terms explain booking responsibilities, payments, trip operations and acceptable website use.'],
  ['cancellation-policy','Cancellation Policy','Legal','Flexible, clearly explained cancellation terms.','Refund and rescheduling eligibility depends on the trip type and notice period.'],
].map(([slug,title,eyebrow,intro,body]) => ({slug,title,eyebrow,intro,sections:[{heading:'Overview',body},{heading:'Need more information?',body:'Contact TravelEnfield before confirming a booking if any part of a package or policy is unclear.'}]}));

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelenfield');
await Promise.all([Destination.deleteMany({}),Trip.deleteMany({}),Category.deleteMany({}),Blog.deleteMany({}),Page.deleteMany({})]);
await Promise.all([Destination.insertMany(destinations),Trip.insertMany(trips),Category.insertMany(categoryData),Blog.insertMany(blogs),Page.insertMany(pageData)]);
console.log(`Seeded ${destinations.length} destinations, ${trips.length} trips, ${categoryData.length} categories, ${blogs.length} blogs and ${pageData.length} pages.`);
await mongoose.disconnect();
