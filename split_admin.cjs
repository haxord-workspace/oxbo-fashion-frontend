const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/AdminPages.tsx');
const outDir = path.join(__dirname, 'src/pages/admin');
const compDir = path.join(__dirname, 'src/components/admin');

if (!fs.existsSync(compDir)) {
  fs.mkdirSync(compDir, { recursive: true });
}

const content = fs.readFileSync(filePath, 'utf-8');

// A generic set of imports that will cover most pages
const commonImports = `import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Filter } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
`;

// Extract PageWrapper
const pageWrapperRegex = /const PageWrapper: React\.FC<[\s\S]*?\n\);\n/;
const pageWrapperMatch = content.match(pageWrapperRegex);
if (pageWrapperMatch) {
  const pageWrapperContent = `import React from 'react';\n\n${pageWrapperMatch[0]}\nexport default PageWrapper;\n`;
  fs.writeFileSync(path.join(compDir, 'PageWrapper.tsx'), pageWrapperContent);
}

const sections = [
  { name: 'AdminDashboard', regex: /export const AdminDashboard = \(\) => \([\s\S]*?\n\);\n/ },
  { name: 'AdminProducts', regex: /const mockAdminProducts = \[[\s\S]*?\];\n\nexport const AdminProducts = \(\) => \{[\s\S]*?\n\};\n/ },
  { name: 'AdminCategories', regex: /const mockAdminCategories = \[[\s\S]*?\];\n\nexport const AdminCategories = \(\) => \{[\s\S]*?\n\};\n/ },
  { name: 'AdminOrders', regex: /const mockAdminOrders = \[[\s\S]*?\];\n\nexport const AdminOrders = \(\) => \([\s\S]*?\n\);\n/ },
  { name: 'AdminUsers', regex: /const mockAdminUsers = \[[\s\S]*?\];\n\nexport const AdminUsers = \(\) => \([\s\S]*?\n\);\n/ },
  { name: 'AdminInventory', regex: /const mockInventory = \[[\s\S]*?\];\n\nexport const AdminInventory = \(\) => \([\s\S]*?\n\);\n/ },
  { name: 'AdminBanners', regex: /export const AdminBanners = \(\) => \{[\s\S]*?\n\};\n/ },
  { name: 'AdminCoupons', regex: /export const AdminCoupons = \(\) => \{[\s\S]*?\n\};\n/ },
  { name: 'AdminReports', regex: /export const AdminReports = \(\) => \([\s\S]*?\n\);\n/ },
  { name: 'AdminSettings', regex: /export const AdminSettings = \(\) => \([\s\S]*?\n\);\n/ },
];

let indexExports = '';

sections.forEach(sec => {
  const match = content.match(sec.regex);
  if (match) {
    const fileContent = `${commonImports}\n${match[0]}`;
    fs.writeFileSync(path.join(outDir, `${sec.name}.tsx`), fileContent);
    indexExports += `export * from './${sec.name}';\n`;
  }
});

// Overwrite AdminPages.tsx with just the exports
fs.writeFileSync(filePath, indexExports);
console.log('Split complete!');
