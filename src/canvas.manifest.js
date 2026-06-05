export const manifest = {
  screens: {
    scr_oj5rbk: { name: "Home", route: "/", position: { "x": 160, "y": 1820 } },
    scr_ew9is6: { name: "All Products", route: "/products", position: { "x": 1560, "y": 1820 } },
    scr_rldbri: { name: "About", route: "/about", position: { "x": 2960, "y": 1820 } },
    scr_b4dwcb: { name: "Contact", route: "/contact", position: { "x": 4360, "y": 1820 } },
    scr_bjs71f: { name: "Seller Login", route: "/login", position: { "x": 0, "y": 0 }, isDefaultRow: true },
    scr_spiprb: { name: "Dashboard", route: "/admin", position: { "x": 160, "y": 3800 } },
    scr_mm0h68: { name: "Manage Products", route: "/admin/products", position: { "x": 1560, "y": 3800 } },
    scr_8mdn8c: { name: "Add Product", route: "/admin/products/new", position: { "x": 2960, "y": 3800 } },
    scr_67bt9h: { name: "Settings", route: "/admin/settings", position: { "x": 4360, "y": 3800 } }
  },
  sections: {
    sec_aspq1t: { name: "Public Pages", x: 0, y: 1600, width: 5720, height: 1180 },
    sec_pt0now: { name: "Admin Dashboard", x: 0, y: 3580, width: 5720, height: 1180 }
  },
  layers: [
  { kind: "screen", id: "scr_bjs71f" },
  { kind: "section", id: "sec_aspq1t", children: [
    { kind: "screen", id: "scr_oj5rbk" },
    { kind: "screen", id: "scr_ew9is6" },
    { kind: "screen", id: "scr_rldbri" },
    { kind: "screen", id: "scr_b4dwcb" }]
  },
  { kind: "section", id: "sec_pt0now", children: [
    { kind: "screen", id: "scr_spiprb" },
    { kind: "screen", id: "scr_mm0h68" },
    { kind: "screen", id: "scr_8mdn8c" },
    { kind: "screen", id: "scr_67bt9h" }]
  }]

};