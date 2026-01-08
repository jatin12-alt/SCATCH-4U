import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/productsSlice';
import ProductCard from '../components/Products/ProductCard';
import ProductFilters from '../components/Products/ProductFilters';
import ProductSkeleton from '../components/ProductSkeleton';
import { Leaf } from 'lucide-react';

export default function Home() {
  const dispatch = useAppDispatch();
  const { items, loading, selectedCategory, selectedMaterial } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = items.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedMaterial && product.material_type !== selectedMaterial) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Leaf className="w-10 h-10 sm:w-12 sm:h-12" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold">SCATCH</h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-green-50 max-w-2xl mx-auto px-2">
            Premium vegan bags crafted with sustainable materials. Luxury meets compassion.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          <aside className="lg:col-span-1">
            <ProductFilters />
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">
                {selectedCategory || selectedMaterial
                  ? `${filteredProducts.length} ${filteredProducts.length === 1 ? 'Product' : 'Products'} Found`
                  : 'All Products'}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone-600 text-lg">No products found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
