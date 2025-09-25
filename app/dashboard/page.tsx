"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Package,
  DollarSign,
  Hash,
  Edit,
  Trash2,
  ShoppingCart,
  User,
  Calendar,
  Plus,
} from "lucide-react";

import useProductsStore from "@/store/products";
import usePurchaseStore from "@/store/purchase";

// Tipo para los productos basado en tu estructura
interface Product {
  id?: number;
  batch: string;
  name: string;
  price: number;
  availableQuantity: number;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
}

// Tipo para los items de compra basado en la estructura real
interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  quantity: number;
  Product: Product;
}
interface Purchase {
  batch?: string;
  id?: number;
  date?: string;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
  clientId?: number;
  PurchaseItems?: PurchaseItem[];
}

export default function DashboardPage() {
  const { products, fetchProducts, deleteProduct, updateProduct, addProduct } =
    useProductsStore();
  const { purchases, fetchPurchases } = usePurchaseStore();

  useEffect(() => {
    fetchProducts();
    fetchPurchases();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product: Product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.id?.toString() || '').includes(searchTerm)
    );
  }, [products, searchTerm]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(
      (purchase: Purchase) =>
        purchase.id?.toString().includes(purchaseSearchTerm) ||
        purchase.clientId?.toString().includes(purchaseSearchTerm) ||
        purchase.PurchaseItems?.some(
          (item) =>
            item.Product.name
              .toLowerCase()
              .includes(purchaseSearchTerm.toLowerCase()) ||
            item.Product.batch
              .toLowerCase()
              .includes(purchaseSearchTerm.toLowerCase())
        )
    );
  }, [purchases, purchaseSearchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum: number, product: Product) =>
      sum + product.price * product.availableQuantity,
    0
  );
  const totalQuantity = products.reduce(
    (sum: number, product: Product) => sum + product.availableQuantity,
    0
  );

  const totalPurchases = purchases.length;
  const totalSales = purchases.reduce(
    (sum: number, purchase: Purchase) => sum + (purchase.total ?? 0),
    0
  );
  const totalItemsSold = purchases.reduce(
    (sum: number, purchase: Purchase) =>
      sum +
      (purchase.PurchaseItems?.reduce(
        (itemSum: number, item: PurchaseItem) => itemSum + item.quantity,
        0
      ) ?? 0),
    0
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    console.log(editingProduct);
    if (editingProduct.isNew) {
      addProduct(editingProduct);
    } else {
      updateProduct(editingProduct.id, editingProduct);
    }
    setIsEditDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id);
    setIsDeleteDialogOpen(false);
    setDeletingProduct(null);
  };

  const updateEditingProduct = (
    field: keyof Product,
    value: string | number
  ) => {
    if (!editingProduct) return;
    setEditingProduct((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard de Gestión
          </h1>
          <p className="text-muted-foreground">
            Gestiona productos y visualiza compras de clientes
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="purchases">Compras</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Productos
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    productos registrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Valor Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(totalValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    valor del inventario
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cantidad Total
                  </CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalQuantity}</div>
                  <p className="text-xs text-muted-foreground">
                    unidades disponibles
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Buscar Productos</CardTitle>
                <CardDescription>
                  Busca por nombre, lote o ID del producto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Lista de Productos</CardTitle>
                    <CardDescription>
                      {filteredProducts.length} de {totalProducts} productos
                      mostrados
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      const newProduct: Product = {
                        batch: "",
                        name: "",
                        price: 0,
                        availableQuantity: 0,
                        entryDate: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isNew: true,
                      };
                      setEditingProduct(newProduct);
                      setIsEditDialogOpen(true);
                    }}
                    className="bg-black text-white hover:bg-black/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Fecha Entrada</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product: Product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            #{product.id}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium capitalize">
                              {product.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {product.batch}
                            </code>
                          </TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.availableQuantity > 50
                                  ? "default"
                                  : product.availableQuantity > 10
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {product.availableQuantity} unidades
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(
                              product.price * product.availableQuantity
                            )}
                          </TableCell>
                          <TableCell>{formatDate(product.entryDate)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.availableQuantity > 0
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {product.availableQuantity > 0
                                ? "Disponible"
                                : "Agotado"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">
                      No se encontraron productos
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            {/* Estadísticas de compras */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Compras
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPurchases}</div>
                  <p className="text-xs text-muted-foreground">
                    compras registradas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ventas Totales
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(totalSales)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ingresos generados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Productos Vendidos
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalItemsSold}</div>
                  <p className="text-xs text-muted-foreground">
                    unidades vendidas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Búsqueda de compras */}
            <Card>
              <CardHeader>
                <CardTitle>Buscar Compras</CardTitle>
                <CardDescription>
                  Busca por ID de compra, cliente, producto o lote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar compras..."
                    value={purchaseSearchTerm}
                    onChange={(e) => setPurchaseSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabla de compras */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de Compras</CardTitle>
                <CardDescription>
                  {filteredPurchases.length} de {totalPurchases} compras
                  mostradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Compra</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente ID</TableHead>
                        <TableHead>Productos Comprados</TableHead>
                        <TableHead>Cantidad Total</TableHead>
                        <TableHead>Precio Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.map((purchase: Purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-medium">
                            #{purchase.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDateTime(purchase.date || "")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Cliente #{purchase.clientId}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {(purchase.PurchaseItems ?? []).map((item) => (
                                <div key={item.id} className="text-sm">
                                  <span className="font-medium capitalize">
                                    {item.Product.name}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    × {item.quantity}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    ({formatPrice(item.Product.price)} c/u)
                                  </span>
                                  <div className="text-xs text-muted-foreground">
                                    Lote:{" "}
                                    <code className="bg-muted px-1 rounded">
                                      {item.Product.batch}
                                    </code>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {(purchase.PurchaseItems ?? []).reduce(
                                (sum, item) => sum + item.quantity,
                                0
                              )}{" "}
                              unidades
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(purchase.total ?? 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredPurchases.length === 0 && (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">
                      No se encontraron compras
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogo para editar producto */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>
                Modifica los datos del producto. Los cambios se guardarán
                automáticamente.
              </DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={editingProduct.name}
                    onChange={(e) =>
                      updateEditingProduct("name", e.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="batch" className="text-right">
                    Lote
                  </Label>
                  <Input
                    id="batch"
                    value={editingProduct.batch}
                    onChange={(e) =>
                      updateEditingProduct("batch", e.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      updateEditingProduct(
                        "price",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Cantidad
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={editingProduct.availableQuantity}
                    onChange={(e) =>
                      updateEditingProduct(
                        "availableQuantity",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="entryDate" className="text-right">
                    Fecha Entrada
                  </Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={editingProduct.entryDate.split("T")[0]}
                    onChange={(e) =>
                      updateEditingProduct(
                        "entryDate",
                        new Date(e.target.value).toISOString()
                      )
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente
                el producto <strong>{deletingProduct?.name}</strong> del
                inventario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProduct}
                className="bg-black text-white "
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
