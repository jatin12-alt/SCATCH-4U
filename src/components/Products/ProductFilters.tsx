import { useState } from 'react';
import { Filter, X } from 'lucide-react';
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

function FilterContent() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-stone-700" />
          <h3 className="font-serif text-lg font-bold text-stone-800">Filters</h3>
        </div>
        {(selectedCategory || selectedMaterial) && (
          <button
            onClick={handleClearFilters}
            className="text-xs sm:text-sm text-green-700 hover:text-green-800 font-semibold transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-stone-800 mb-4">Category</h4>
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 text-stone-800 border-stone-300 focus:ring-2 focus:ring-stone-400 accent-stone-800"
              />
              <span className="text-sm text-stone-700 group-hover:text-stone-900 font-medium">{category}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === null}
              onChange={() => handleCategoryChange(null)}
              className="w-4 h-4 text-stone-800 border-stone-300 focus:ring-2 focus:ring-stone-400 accent-stone-800"
            />
            <span className="text-sm text-stone-700 group-hover:text-stone-900 font-medium">All Categories</span>
          </label>
        </div>
      </div>

      <div className="border-t border-stone-200 pt-6">
        <h4 className="font-semibold text-stone-800 mb-4">Material Type</h4>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {materials.map((material) => (
            <label key={material} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="material"
                checked={selectedMaterial === material}
                onChange={() => handleMaterialChange(material)}
                className="w-4 h-4 text-stone-800 border-stone-300 focus:ring-2 focus:ring-stone-400 accent-stone-800"
              />
              <span className="text-sm text-stone-700 group-hover:text-stone-900 font-medium">{material}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="material"
              checked={selectedMaterial === null}
              onChange={() => handleMaterialChange(null)}
              className="w-4 h-4 text-stone-800 border-stone-300 focus:ring-2 focus:ring-stone-400 accent-stone-800"
            />
            <span className="text-sm text-stone-700 group-hover:text-stone-900 font-medium">All Materials</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default function ProductFilters() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { selectedCategory, selectedMaterial } = useAppSelector((state) => state.products);

  const hasActiveFilters = selectedCategory || selectedMaterial;

  return (
    <>
      <div className="hidden lg:block">
        <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
          <FilterContent />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsMobileOpen(true)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            hasActiveFilters
              ? 'bg-green-700 text-white'
              : 'bg-stone-800 text-white hover:bg-stone-900'
          }`}
          title="Open filters"
        >
          <Filter className="w-6 h-6" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold text-white">
              1
            </span>
          )}
        </button>
      </div>

      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom">
              <div className="sticky top-0 bg-white border-b border-stone-200 p-4 sm:p-6 rounded-t-3xl flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">Filters</h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-stone-700" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-96 sm:max-h-[70vh]">
                <div className="p-4 sm:p-6">
                  <FilterContent />
                </div>
              </div>

              <div className="sticky bottom-0 bg-stone-50 border-t border-stone-200 p-4 sm:p-6 flex gap-3">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="flex-1 bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-900 transition-colors font-semibold"
                >
                  Apply
                </button>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="flex-1 border-2 border-stone-300 text-stone-800 py-3 rounded-lg hover:bg-stone-50 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
