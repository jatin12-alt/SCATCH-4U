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
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
  product: Product;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_phone: string;
  payment_method: string;
  created_at: string;
  order_items: OrderItem[];
}

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Order[];
});

export const fetchUserOrders = createAsyncThunk('orders/fetchUserOrders', async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Order[];
});

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (
    {
      userId,
      cartItems,
      shippingInfo,
    }: {
      userId: string;
      cartItems: { product_id: string; quantity: number; price: number }[];
      shippingInfo: {
        name: string;
        address: string;
        city: string;
        postalCode: string;
        phone: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          shipping_name: shippingInfo.name,
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_postal_code: shippingInfo.postalCode,
          shipping_phone: shippingInfo.phone,
          payment_method: 'cod',
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      const { data: fullOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products(*)
          )
        `)
        .eq('id', order.id)
        .single();

      if (fetchError) throw fetchError;
      return fullOrder as unknown as Order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select(`
        *,
        order_items (
          *,
          product:products(*)
        )
      `)
      .single();

    if (error) throw error;
    return data as unknown as Order;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default ordersSlice.reducer;
