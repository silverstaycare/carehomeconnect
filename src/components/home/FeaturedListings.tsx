
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Mock data for featured listings
const featuredHomes = [
  {
    id: '1',
    name: 'Sunshine Senior Care',
    location: 'San Francisco, CA',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    amenities: ['24/7 Staff', 'Private Rooms', 'Memory Care', 'Garden'],
    rating: 4.8,
    reviews: 45
  },
  {
    id: '2',
    name: 'Golden Years Manor',
    location: 'Los Angeles, CA',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
    amenities: ['Medication Management', 'Social Activities', 'Gourmet Meals', 'Physical Therapy'],
    rating: 4.6,
    reviews: 38
  },
  {
    id: '3',
    name: 'Serenity Care Home',
    location: 'Seattle, WA',
    price: 2950,
    image: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09',
    amenities: ['Beautiful Garden', 'Private Bathrooms', 'Housekeeping', 'Transportation'],
    rating: 4.9,
    reviews: 52
  }
];

const FeaturedListings = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Care Homes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our top-rated care homes with excellent amenities and services for your loved ones.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredHomes.map(home => (
            <Card key={home.id} className="overflow-hidden care-card">
              <div className="relative">
                <AspectRatio ratio={16 / 9}>
                  <img 
                    src={home.image} 
                    alt={home.name} 
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white text-care-700">
                    ★ {home.rating} ({home.reviews})
                  </Badge>
                </div>
              </div>
              
              <CardContent className="pt-6">
                <h3 className="font-bold text-xl mb-1">{home.name}</h3>
                <p className="text-gray-600 mb-4">{home.location}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {home.amenities.slice(0, 3).map(amenity => (
                    <span key={amenity} className="amenity-badge">
                      {amenity}
                    </span>
                  ))}
                  {home.amenities.length > 3 && (
                    <span className="amenity-badge">+{home.amenities.length - 3} more</span>
                  )}
                </div>
                <p className="font-semibold text-lg">
                  ${home.price.toLocaleString()}/month
                </p>
              </CardContent>
              
              <CardFooter className="border-t pt-4">
                <Button 
                  onClick={() => navigate(`/property/${home.id}`)} 
                  className="w-full"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            onClick={() => navigate('/search')} 
            variant="outline" 
            className="px-8"
          >
            View All Care Homes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
