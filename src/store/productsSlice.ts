import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Tote' | 'Backpack' | 'Clutches';
  material_type: string;
  stock_count: number;
  image_url: string | null;
  is_vegan: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  selectedMaterial: string | null;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  selectedCategory: null,
  selectedMaterial: null,
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Product[];
});

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, updates }: { id: string; updates: Partial<Product> }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedMaterial: (state, action: PayloadAction<string | null>) => {
      state.selectedMaterial = action.payload;
    },
    clearFilters: (state) => {
      state.selectedCategory = null;
      state.selectedMaterial = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setSelectedCategory, setSelectedMaterial, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;
