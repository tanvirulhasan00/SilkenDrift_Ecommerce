import React from "react";
import { Outlet } from "react-router";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";

export default function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-silk-50 dark:bg-dark-bg text-silk-950 dark:text-silk-100">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
