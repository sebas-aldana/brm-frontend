import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/axios";
import useProductsStore from "./products";

const API_URL = "/purchases";

const usePurchaseStore = create(
  persist(
    (set, get) => ({
      purchases: [],
      loading: false,
      error: null,

      fetchPurchases: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(API_URL);
          set({ purchases: response.data, loading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error fetching purchases",
            loading: false,
          });
          throw error;
        }
      },

      createPurchase: async (cart, user) => {
        set({ loading: true, error: null });
        try {
          const purchaseData = {
            clientId: user.id,
            items: cart.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          };
          const response = await api.post(API_URL, purchaseData);

          const { fetchProducts } = useProductsStore.getState();
          await fetchProducts();

          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error creating purchase",
            loading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "purchase-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default usePurchaseStore;
