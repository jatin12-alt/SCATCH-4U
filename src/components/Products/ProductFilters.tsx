import { Filter } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedCategory, setSelectedMaterial, clearFilters } from '../../store/productsSlice';

const categories = ['Tote', 'Backpack', 'Clutches'];
const materials = [
  'Cork Leather',
  'Recycled PET',
  'Piñatex',
  'Organic Cotton',
  'Apple Leather',
  'Mushroom Leather',
  'Cactus Leather',
  'Recycled Nylon',
];

export default function ProductFilters() {
  const dispatch = useAppDispatch();
  const { selectedCategory, selectedMaterial } = useAppSelector((state) => state.products);

  const handleCategoryChange = (category: string | null) => {
    dispatch(setSelectedCategory(category));
  };

  const handleMaterialChange = (material: string | null) => {
    dispatch(setSelectedMaterial(material));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-stone-700" />
          <h3 className="font-serif text-lg font-bold text-stone-800">Filters</h3>
        </div>
        {(selectedCategory || selectedMaterial) && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-stone-600 hover:text-stone-800 underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div>
        <h4 className="font-medium text-stone-700 mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 text-stone-800 border-stone-300 focus:ring-stone-400"
              />
              <span className="text-sm text-stone-700 group-hover:text-stone-900">{category}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === null}
              onChange={() => handleCategoryChange(null)}
              className="w-4 h-4 text-stone-800 border-stone-300 focus:ring-stone-400"
            />
            <span className="text-sm text-stone-700 group-hover:text-stone-900">All Categories</span>
          </label>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-medium text-stone-700 mb-3">Material Type</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {materials.map((material) => (
            <label key={material} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="material"
                checked={selectedMaterial === material}
                onChange={() => handleMaterialChange(material)}
                className="w-4 h-4 text-stone-800 border-stone-300 focus:ring-stone-400"
              />
              <span className="text-sm text-stone-700 group-hover:text-stone-900">{material}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="material"
              checked={selectedMaterial === null}
              onChange={() => handleMaterialChange(null)}
              className="w-4 h-4 text-stone-800 border-stone-300 focus:ring-stone-400"
            />
            <span className="text-sm text-stone-700 group-hover:text-stone-900">All Materials</span>
          </label>
        </div>
      </div>
    </div>
  );
}
