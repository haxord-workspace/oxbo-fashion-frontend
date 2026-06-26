// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Oxbo Fashion. All rights reserved.
      </div>
    </footer>
  );
}
