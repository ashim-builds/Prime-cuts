import CategoryCard from "./CategoryCard";

interface CategorySliderProps {
  categories: string[];
}

export default function CategorySlider({ categories }: CategorySliderProps) {
  return (
    <div className="w-full overflow-x-auto py-2 px-1 custom-scrollbar">
      <div className="flex gap-4 min-w-max">
        {categories.map((cat) => (
          <div key={cat} className="w-32 flex-shrink-0">
            <CategoryCard
              name={cat}
              slug={cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              image="/images/cat_steaks.jpg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
