import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LocationSearchBox from "@/components/search/LocationSearchBox";
import SearchFilters from "@/components/search/SearchFilters";
import PropertiesGrid from "@/components/search/PropertiesGrid";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  amenities: string[];
  rating: number;
  reviews: number;
}

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialLocation = searchParams.get("location") || "";
  
  const [searchLocation, setSearchLocation] = useState(initialLocation);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([2000, 5000]);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const amenitiesList = [
    "Private Rooms",
    "24/7 Staff",
    "Memory Care",
    "Garden",
    "Transportation",
    "Medication Management",
    "Social Activities",
    "Housekeeping"
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockProperties: Property[] = [
          {
            id: "1",
            name: "Sunshine Senior Care",
            location: "San Francisco, CA",
            price: 2800,
            image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
            amenities: ["24/7 Staff", "Private Rooms", "Memory Care", "Garden"],
            rating: 4.8,
            reviews: 45
          },
          {
            id: "2",
            name: "Golden Years Manor",
            location: "Los Angeles, CA",
            price: 3200,
            image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
            amenities: ["Medication Management", "Social Activities", "Gourmet Meals", "Physical Therapy"],
            rating: 4.6,
            reviews: 38
          },
          {
            id: "3",
            name: "Serenity Care Home",
            location: "Seattle, WA",
            price: 2950,
            image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",
            amenities: ["Beautiful Garden", "Private Bathrooms", "Housekeeping", "Transportation"],
            rating: 4.9,
            reviews: 52
          },
          {
            id: "4",
            name: "Tranquil Gardens Care",
            location: "Portland, OR",
            price: 3100,
            image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
            amenities: ["Transportation", "24/7 Staff", "Meal Service", "Social Activities"],
            rating: 4.7,
            reviews: 29
          },
          {
            id: "5",
            name: "Harmony House",
            location: "San Diego, CA",
            price: 2600,
            image: "https://images.unsplash.com/photo-1577495508048-b635879837f1",
            amenities: ["Private Rooms", "Medication Management", "Housekeeping", "Garden"],
            rating: 4.5,
            reviews: 33
          }
        ];
        
        setProperties(mockProperties);
        setFilteredProperties(mockProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const filtered = properties.filter(property => {
      const inPriceRange = property.price >= priceRange[0] && property.price <= priceRange[1];
      
      const hasSelectedAmenities = selectedAmenities.length === 0 || 
        selectedAmenities.some(amenity => property.amenities.includes(amenity));
      
      const matchesLocation = searchLocation === "" || 
        property.location.toLowerCase().includes(searchLocation.toLowerCase());
      
      return inPriceRange && hasSelectedAmenities && matchesLocation;
    });
    
    setFilteredProperties(filtered);
    navigate(`/search?location=${encodeURIComponent(searchLocation)}`);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleReset = () => {
    setSearchLocation("");
    setPriceRange([1000, 10000]);
    setSelectedAmenities([]);
  };

  return (
    <div className="container py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <LocationSearchBox
              value={searchLocation}
              onChange={setSearchLocation}
              onSearch={handleSearch}
            />
          </div>
          <Button type="submit">Search</Button>
          <SearchFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedAmenities={selectedAmenities}
            toggleAmenity={toggleAmenity}
            amenitiesList={amenitiesList}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
          />
        </form>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {loading ? "Searching..." : `${filteredProperties.length} Care Homes Found`}
        </h2>
      </div>

      <PropertiesGrid 
        properties={filteredProperties}
        loading={loading}
        onReset={handleReset}
      />
    </div>
  );
};

export default SearchResults;
