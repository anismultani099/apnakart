# ApnaKart 🛍️

A responsive frontend e-commerce website built using **HTML, CSS, and JavaScript**, showcasing a complete men's fashion shopping experience — from browsing products to cart, wishlist, checkout, and an admin panel.

> ⚠️ This is a **static frontend demo build**. Cart, wishlist, login, orders, and admin panel are simulated using browser `localStorage` for showcase purposes — there is no real backend/database connected.

🔗 **Live Demo:** https://anismultani099.github.io/apnakart/

## Features

- Browse products by category (Topwear, Bottomwear, Ethnicwear, Winterwear, and more)
- Product detail pages with image gallery, size selection, and quantity stepper
- Add products to cart and adjust quantity
- Add/remove products from wishlist
- Search products by name or category
- User login / register (demo session via localStorage)
- Checkout flow with address and payment method selection
- Order history and order details (sample data)
- User profile, edit profile, and change password pages
- Admin panel — dashboard with stats, manage products, categories, orders, and messages
- Fully responsive design for mobile and desktop

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Font Awesome Icons
- Google Fonts (Poppins)

## Project Structure

```
apnakart/
├── index.html
├── pages/
│   ├── index.html
│   ├── products.html
│   ├── product_details.html
│   ├── cart.html
│   ├── wishlist.html
│   ├── login.html
│   ├── register.html
│   ├── checkout.html
│   ├── orders.html
│   ├── order_details.html
│   ├── order_success.html
│   ├── user_profile.html
│   ├── user_edit_profile.html
│   ├── user_change_password.html
│   ├── about.html
│   ├── contact.html
│   ├── search.html
│   └── admin/
│       ├── admin_login.html
│       ├── dashboard.html
│       ├── admin_products.html
│       ├── admin_categories.html
│       ├── admin_orders.html
│       └── admin_messages.html
└── assets/
    ├── css/
    ├── js/
    └── images/
```

## Running Locally

Since this is a static site, no build step or server is required.

1. Clone the repository
   ```
   git clone https://github.com/anismultani099/apnakart.git
   ```
2. Open `index.html` in your browser, or use a simple local server (e.g. VS Code Live Server extension) for the best experience.

## Notes

- This project was originally built with a PHP + MySQL backend. This repository contains the **converted static frontend version** for portfolio/demo purposes, since GitHub Pages only supports static hosting.
- Product and category data is preloaded from a JSON dataset embedded in the project.

## Author

**Anis Multani**
