import React from "react";
import { Link } from "react-router";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "~/components/ui/Button";

export default function DecoyAdminPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-silk-50 dark:bg-dark-bg">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <span className="text-8xl sm:text-9xl font-serif font-black tracking-tighter text-silk-200 dark:text-dark-elevated select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-serif font-bold text-silk-900 dark:text-silk-100 bg-white/90 dark:bg-dark-surface/90 px-4 py-1 rounded-full shadow-sm border border-silk-200 dark:border-dark-border">
              Page Not Found
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-serif font-bold text-silk-950 dark:text-silk-50">
            Lost in the Silk Weaves?
          </h2>
          <p className="text-xs sm:text-sm text-silk-600 dark:text-silk-300 max-w-sm mx-auto leading-relaxed">
            The page you requested does not exist, has been archived, or was moved. Explore our handcrafted sarees and heritage silk collection instead.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              <span>Back to Home</span>
            </Button>
          </Link>

          <Link to="/shop" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              <span>Browse Shop</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
