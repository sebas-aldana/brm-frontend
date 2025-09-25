"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {activeTab === "login" ? "Iniciar Sesión" : "Registro de Usuario"}
          </h1>
          <p className="text-muted-foreground">
            {activeTab === "login"
              ? "Accede a tu cuenta"
              : "Crea tu cuenta para comenzar"}
          </p>
        </div>

        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={activeTab === "login" ? "default" : "ghost"}
            className={`flex-1 ${
              activeTab === "login"
                ? "bg-black text-white hover:bg-black/90"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </Button>
          <Button
            variant={activeTab === "register" ? "default" : "ghost"}
            className={`flex-1 ${
              activeTab === "register"
                ? "bg-black text-white hover:bg-black/90"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Registro
          </Button>
        </div>

        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
