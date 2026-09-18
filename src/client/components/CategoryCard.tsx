import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  slug: string;
  image?: string;
  count?: number;
}

export default function CategoryCard({ name, slug, image, count }: CategoryCardProps) {
  return (
    <Link
      to={`/shop?category=${encodeURIComponent(name)}`}
      className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-lg hover:border-primary transition-all text-center overflow-hidden"
    >
      <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mb-3 overflow-hidden group-hover:scale-110 group-hover:border-primary transition-all shadow-inner">
        <img
          src={image || "/images/cat_chicken.jpg"}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <h4 className="font-extrabold text-[14px] md:text-[15px] text-stone-900 group-hover:text-primary transition-colors leading-snug">
        {name}
      </h4>
      {count !== undefined && (
        <span className="text-[11px] font-semibold text-stone-400 mt-0.5">
          {count} {count === 1 ? "Item" : "Items"}
        </span>
      )}
    </Link>
  );
}
