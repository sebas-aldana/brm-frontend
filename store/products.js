import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/axios";

const API_URL = "/products";

// Define the store's state shape
const useProductsStore = create(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,

      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get(API_URL);
          set({ products: data, loading: false });
          return data;
        } catch (error) {
          console.error("Error fetching products:", error);
          set({
            error:
              error.response?.data?.message || "Error al cargar los productos",
            loading: false,
          });
          throw error;
        }
      },

      addProduct: async (product) => {
        try {
          const { data } = await api.post(API_URL, product);
          get().fetchProducts();
          return data;
        } catch (error) {
          console.error("Error adding product:", error);
          throw error;
        }
      },

      updateProduct: async (id, updates) => {
        try {
          const { data } = await api.put(`${API_URL}/${id}`, updates);
          get().fetchProducts();
          return data;
        } catch (error) {
          console.error("Error updating product:", error);
          throw error;
        }
      },

      deleteProduct: async (id) => {
        try {
          await api.delete(`${API_URL}/${id}`);
          get().fetchProducts();
        } catch (error) {
          console.error("Error deleting product:", error);
          throw error;
        }
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },

      clearProducts: () => set({ products: [] }),
    }),
    {
      name: "products-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({ products: state.products }), // only persist products
    }
  )
);

export default useProductsStore;
