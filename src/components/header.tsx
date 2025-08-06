"use client";

import { CircleUserRound, LogOut } from "lucide-react";
import React, { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import Menu from "@/components/menu";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#004D61] h-24 flex items-center justify-between px-6 sticky top-0 left-0 z-50 w-full">
      <span className="text-white font-bold text-base capitalize">
        {user?.name || "Usuário"}
      </span>

      <div className="relative flex items-center gap-4">
        <CircleUserRound
          strokeWidth={1}
          color="#FF5031"
          size={40}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        />

        {/* Menu Dropdown no mobile */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded shadow z-50 ">
            <div className="block lg:hidden">
              <Suspense
                fallback={<div className="p-4">Carregando menu...</div>}
              >
                <Menu />
              </Suspense>
            </div>

            {/* Logout no menu (opcional, redundante) */}
            <div className="border-t p-2 ">
              <button
                onClick={() => logout()}
                className="text-red-500  flex items-center gap-2 w-full text-center text-sm  cursor-pointer"
              >
                <LogOut /> Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
