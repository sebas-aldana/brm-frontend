"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Package,
  CheckCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import usePurchaseStore from "@/store/purchase";
import useProductsStore from "@/store/products";

interface Product {
  id: number;
  batch: string;
  name: string;
  price: number;
  availableQuantity: number;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ShopPage() {
  const { fetchProducts, products } = useProductsStore();
  const { createPurchase } = usePurchaseStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseTotal, setPurchaseTotal] = useState(0);

  const filteredProducts = products.filter(
    (product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        if (existingItem.quantity < product.availableQuantity) {
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prevCart;
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === productId
      );
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter((item) => item.product.id !== productId);
      }
    });
  };

  const removeItemFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const getCartQuantity = (productId: number) => {
    const cartItem = cart.find((item) => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    createPurchase(cart, localStorage.getItem("user"));

    setPurchaseTotal(cartTotal);
    setShowSuccessModal(true);
    setCart([]);

    setTimeout(() => {
      setShowSuccessModal(false);
    }, 5000);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-green-600">
              ¡Compra Exitosa!
            </DialogTitle>
            <DialogDescription className="text-center">
              Tu compra por un total de{" "}
              <span className="font-bold text-green-600">
                ${purchaseTotal.toLocaleString()}
              </span>{" "}
              ha sido procesada exitosamente.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center text-sm text-muted-foreground">
            Este mensaje se cerrará automáticamente en unos segundos...
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sección de productos */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Tienda</h1>
              <p className="text-muted-foreground">
                Selecciona los productos que deseas comprar
              </p>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product: Product) => {
              const cartQuantity = getCartQuantity(product.id);
              const isOutOfStock = product.availableQuantity === 0;
              const isMaxQuantity = cartQuantity >= product.availableQuantity;

              return (
                <Card
                  key={product.id}
                  className={`${isOutOfStock ? "opacity-50" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">
                        {product.name}
                      </CardTitle>
                      <Badge
                        variant={
                          isOutOfStock
                            ? "destructive"
                            : product.availableQuantity < 10
                            ? "secondary"
                            : "default"
                        }
                      >
                        {isOutOfStock
                          ? "Agotado"
                          : `${product.availableQuantity} disponibles`}
                      </Badge>
                    </div>
                    <CardDescription>Lote: {product.batch}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    {cartQuantity > 0 ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(product.id)}
                          disabled={isOutOfStock}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium min-w-[2rem] text-center">
                          {cartQuantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={isOutOfStock || isMaxQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar al carrito
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">
                No se encontraron productos
              </h3>
              <p className="text-muted-foreground">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>

        {/* Carrito de compras */}
        <div className="w-full lg:w-96">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito ({cartItemsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium capitalize">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.product.price.toLocaleString()} x{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium min-w-[1.5rem] text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToCart(item.product)}
                          disabled={
                            item.quantity >= item.product.availableQuantity
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromCart(item.product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {cart.length > 0 && (
              <CardFooter className="flex flex-col gap-4">
                <Separator />
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${cartTotal.toLocaleString()}
                  </span>
                </div>
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Pagar
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
