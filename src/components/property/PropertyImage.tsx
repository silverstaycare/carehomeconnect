
import { cn } from "@/lib/utils";

interface PropertyImageProps {
  image: string;
  name: string;
  className?: string;
}

const PropertyImage = ({ image, name, className }: PropertyImageProps) => {
  return (
    <div className={cn("rounded-lg overflow-hidden h-80", className)}>
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default PropertyImage;
