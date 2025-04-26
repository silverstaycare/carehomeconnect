
import React, { useState, useEffect } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search } from "lucide-react";

// Mock city data - in a real app, this would come from an API
const cities = [
  "San Francisco, CA",
  "Los Angeles, CA",
  "San Diego, CA",
  "San Jose, CA",
  "Sacramento, CA",
  "Seattle, WA",
  "Portland, OR",
  "Phoenix, AZ",
  "Las Vegas, NV",
  "Denver, CO"
];

interface LocationSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

const LocationSearchBox = ({ value, onChange, onSearch }: LocationSearchBoxProps) => {
  const [open, setOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  useEffect(() => {
    if (value.length >= 3) {
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setOpen(true);
    } else {
      setFilteredCities([]);
      setOpen(false);
    }
  }, [value]);

  const handleSelect = (city: string) => {
    onChange(city);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="City, state, or zip code"
            value={value}
            onValueChange={onChange}
            className="pl-10"
          />
        </Command>
      </div>
      
      {open && value.length >= 3 && (
        <div className="absolute w-full bg-white border rounded-lg mt-1 shadow-lg max-h-64 overflow-auto z-50">
          {filteredCities.length === 0 ? (
            <div className="py-6 text-center text-sm">No locations found.</div>
          ) : (
            <div className="p-1">
              {filteredCities.map((city) => (
                <div 
                  key={city}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                  onClick={() => handleSelect(city)}
                >
                  <Search className="h-4 w-4" />
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearchBox;
