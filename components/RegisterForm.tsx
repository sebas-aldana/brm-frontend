"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login, register } from "@/store/auth";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegisterForm() {
  const router = useRouter();
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cliente",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const registerResponse = await register(registerData);
    const loginResponse = await login({
      email: registerData.email,
      password: registerData.password,
    });
    switch (loginResponse.user.role) {
      case "cliente":
        router.push("/shop");
        break;
      case "admin":
        router.push("/dashboard");
        break;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Crear Cuenta</CardTitle>
        <CardDescription>
          Completa los siguientes campos para registrarte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-name">Nombre</Label>
            <Input
              id="register-name"
              type="text"
              placeholder="Ingresa tu nombre"
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({ ...registerData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="tu@email.com"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Contraseña</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              minLength={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={registerData.role}
              onValueChange={(value) =>
                setRegisterData({ ...registerData, role: value })
              }
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-black/90"
          >
            Crear Cuenta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
