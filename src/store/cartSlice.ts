import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  material_type: string;
  stock_count: number;
  image_url: string | null;
  is_vegan: boolean;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (userId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      product_id,
      quantity,
      product:products(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data as unknown as CartItem[];
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, productId, quantity = 1 }: { userId: string; productId: string; quantity?: number }) => {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select(`
          id,
          product_id,
          quantity,
          product:products(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as CartItem;
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: productId, quantity })
        .select(`
          id,
          product_id,
          quantity,
          product:products(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as CartItem;
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', cartItemId)
      .select(`
        id,
        product_id,
        quantity,
        product:products(*)
      `)
      .single();

    if (error) throw error;
    return data as unknown as CartItem;
  }
);

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (cartItemId: string) => {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);

  if (error) throw error;
  return cartItemId;
});

export const clearCart = createAsyncThunk('cart/clearCart', async (userId: string) => {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);

  if (error) throw error;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const existingIndex = state.items.findIndex((item) => item.id === action.payload.id);
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
