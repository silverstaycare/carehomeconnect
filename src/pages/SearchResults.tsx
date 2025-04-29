
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import LocationSearchBox from "@/components/search/LocationSearchBox";
import SearchFilters from "@/components/search/SearchFilters";
import PropertiesGrid from "@/components/search/PropertiesGrid";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  city: string;
  state: string;
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
        setLoading(true);
        
        // Base query to fetch properties
        let query = supabase
          .from('care_homes')
          .select('*');

        // Filter by location if provided
        if (searchLocation) {
          query = query.or(
            `city.ilike.%${searchLocation}%, state.ilike.%${searchLocation}%`
          );
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Transform data and fetch images for each property
        const transformedProperties = await Promise.all(data?.map(async (home) => {
          // Fetch primary image for this property
          const { data: mediaData } = await supabase
            .from('care_home_media')
            .select('photo_url')
            .eq('care_home_id', home.id)
            .eq('is_primary', true)
            .maybeSingle();
            
          // For now, use placeholder ratings and reviews
          return {
            id: home.id,
            name: home.name,
            location: `${home.city}, ${home.state}`,
            price: home.price,
            city: home.city,
            state: home.state,
            image: mediaData?.photo_url || "/placeholder.svg",
            amenities: [], // We'll add real amenities in a future update
            rating: 4.5,
            reviews: 45
          };
        }) || []);

        setProperties(transformedProperties);
        setFilteredProperties(transformedProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchLocation]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const filtered = properties.filter(property => {
      const inPriceRange = property.price >= priceRange[0] && property.price <= priceRange[1];
      
      const matchesLocation = searchLocation === "" || 
        property.location.toLowerCase().includes(searchLocation.toLowerCase());
      
      return inPriceRange && matchesLocation;
    });
    
    setFilteredProperties(filtered);
    navigate(`/search?location=${encodeURIComponent(searchLocation)}`);
  };

  const handleReset = () => {
    setSearchLocation("");
    setPriceRange([1000, 10000]);
    setSelectedAmenities([]);
    setFilteredProperties(properties);
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
            toggleAmenity={() => {}} // Placeholder since we're not using amenities filtering yet
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
