# Menu Items Database (MongoDB Atlas)

## Current Menu Items Stored in Cloud Database

These items are seeded into MongoDB Atlas when you run `npm run seed` in the backend.

---

## 📊 Menu Statistics:
- **Total Items:** 12
- **Vegetarian Items:** 9
- **Non-Vegetarian Items:** 3
- **Categories:** 6 (Main Course, Starter, Dessert, Beverage, Snacks, Combo)

---

## 🍽️ Complete Menu List:

### 1️⃣ **Paneer Butter Masala**
- **Category:** Main Course
- **Type:** Vegetarian 🟢
- **Price:** ₹280
- **Description:** Creamy tomato-based curry with soft paneer cubes
- **Preparation Time:** 25 minutes
- **Tags:** Popular, Spicy
- **Status:** Available

---

### 2️⃣ **Chicken Biryani**
- **Category:** Main Course
- **Type:** Non-Vegetarian 🔴
- **Price:** ₹320
- **Description:** Aromatic basmati rice with tender chicken pieces and spices
- **Preparation Time:** 35 minutes
- **Tags:** Popular, Bestseller
- **Status:** Available

---

### 3️⃣ **Veg Manchurian**
- **Category:** Starter
- **Type:** Vegetarian 🟢
- **Price:** ₹180
- **Description:** Crispy vegetable balls in tangy Indo-Chinese sauce
- **Preparation Time:** 20 minutes
- **Tags:** Starter, Chinese
- **Status:** Available

---

### 4️⃣ **Dal Makhani**
- **Category:** Main Course
- **Type:** Vegetarian 🟢
- **Price:** ₹220
- **Description:** Rich black lentils cooked in butter and cream
- **Preparation Time:** 30 minutes
- **Tags:** Popular
- **Status:** Available

---

### 5️⃣ **Chicken Tikka**
- **Category:** Starter
- **Type:** Non-Vegetarian 🔴
- **Price:** ₹260
- **Description:** Grilled marinated chicken pieces with aromatic spices
- **Preparation Time:** 25 minutes
- **Tags:** Grilled, Tandoor
- **Status:** Available

---

### 6️⃣ **Gulab Jamun**
- **Category:** Dessert
- **Type:** Vegetarian 🟢
- **Price:** ₹80
- **Description:** Soft milk-solid dumplings in sweet rose-flavored syrup
- **Preparation Time:** 10 minutes
- **Tags:** Sweet, Popular
- **Status:** Available

---

### 7️⃣ **Masala Dosa**
- **Category:** Snacks
- **Type:** Vegetarian 🟢
- **Price:** ₹120
- **Description:** Crispy rice crepe filled with spiced potato filling
- **Preparation Time:** 20 minutes
- **Tags:** South Indian, Breakfast
- **Status:** Available

---

### 8️⃣ **Fresh Lime Soda**
- **Category:** Beverage
- **Type:** Vegetarian 🟢
- **Price:** ₹60
- **Description:** Refreshing lime juice with soda and a hint of mint
- **Preparation Time:** 5 minutes
- **Tags:** Refreshing, Cold
- **Status:** Available

---

### 9️⃣ **Veg Thali**
- **Category:** Combo
- **Type:** Vegetarian 🟢
- **Price:** ₹250
- **Description:** Complete meal with dal, sabji, roti, rice, and dessert
- **Preparation Time:** 30 minutes
- **Tags:** Combo, Value
- **Status:** Available

---

### 🔟 **Butter Naan**
- **Category:** Snacks
- **Type:** Vegetarian 🟢
- **Price:** ₹40
- **Description:** Soft leavened bread brushed with butter
- **Preparation Time:** 15 minutes
- **Tags:** Bread
- **Status:** Available

---

### 1️⃣1️⃣ **Fish Fry**
- **Category:** Starter
- **Type:** Non-Vegetarian 🔴
- **Price:** ₹300
- **Description:** Crispy fried fish marinated with coastal spices
- **Preparation Time:** 25 minutes
- **Tags:** Seafood, Crispy
- **Status:** Available

---

### 1️⃣2️⃣ **Mango Lassi**
- **Category:** Beverage
- **Type:** Vegetarian 🟢
- **Price:** ₹80
- **Description:** Sweet yogurt drink blended with ripe mangoes
- **Preparation Time:** 5 minutes
- **Tags:** Cold, Sweet
- **Status:** Available

---

## 📂 Category Breakdown:

### Main Course (2 items)
1. Paneer Butter Masala - ₹280 (Veg)
2. Chicken Biryani - ₹320 (Non-Veg)
3. Dal Makhani - ₹220 (Veg)

### Starter (3 items)
1. Veg Manchurian - ₹180 (Veg)
2. Chicken Tikka - ₹260 (Non-Veg)
3. Fish Fry - ₹300 (Non-Veg)

### Dessert (1 item)
1. Gulab Jamun - ₹80 (Veg)

### Beverage (2 items)
1. Fresh Lime Soda - ₹60 (Veg)
2. Mango Lassi - ₹80 (Veg)

### Snacks (2 items)
1. Masala Dosa - ₹120 (Veg)
2. Butter Naan - ₹40 (Veg)

### Combo (1 item)
1. Veg Thali - ₹250 (Veg)

---

## 💰 Price Range:
- **Cheapest:** Butter Naan - ₹40
- **Most Expensive:** Chicken Biryani - ₹320
- **Average Price:** ₹172

---

## ⏱️ Preparation Time:
- **Fastest:** Fresh Lime Soda, Mango Lassi - 5 minutes
- **Slowest:** Chicken Biryani - 35 minutes
- **Average Time:** 20 minutes

---

## 🔐 Access Control:

### Super Admin (`superadmin@fooddelivery.com`)
**Can perform all operations:**
- ✅ View all menu items
- ✅ Add new menu items
- ✅ Edit existing items (name, price, description, category, etc.)
- ✅ Delete menu items
- ✅ Toggle availability status
- ✅ Update images and tags
- ✅ Change preparation time
- ✅ Set vegetarian/non-vegetarian status

### Normal Admin (`admin@fooddelivery.com`)
**Cannot access menu management:**
- ❌ No access to menu page
- ❌ Cannot add, edit, or delete items
- ✅ Can only manage orders

---

## 📝 Database Schema (MenuItem Model):

```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  image: String (default: placeholder),
  category: String (required) - [Starter, Main Course, Dessert, Beverage, Snacks, Combo],
  isVeg: Boolean (default: true),
  isAvailable: Boolean (default: true),
  preparationTime: Number (default: 30 minutes),
  rating: Number (0-5),
  tags: Array of Strings,
  timestamps: { createdAt, updatedAt }
}
```

---

## 🚀 How to Access Menu Management:

### For Super Admin:
1. Login at: http://localhost:5174/login
2. Email: `superadmin@fooddelivery.com`
3. Password: `SuperAdmin@123`
4. Navigate to: **Menu** (in navbar)
5. You'll see all 12 items with Edit/Delete buttons

### Operations Available:
- **Add New Item:** Click "Add New Item" button
- **Edit Item:** Click "Edit" button on any menu card
- **Delete Item:** Click "Delete" button (with confirmation)
- **View Details:** All items displayed in card format with images

---

## 🗄️ Database Location:

**MongoDB Atlas:**
- Cluster: `food-cart.1cbjuuu.mongodb.net`
- Database: `fooddelivery`
- Collection: `menuitems`
- Total Documents: 12 (after seeding)

---

## 🔄 To Reset/Update Menu:

```bash
cd backend
npm run seed
```

This will:
1. Clear existing menu items
2. Re-create all 12 default items
3. Create both admin accounts
4. Show confirmation message

---

## 📱 Where Menu Items Appear:

### User App (http://localhost:5173):
- Homepage menu listing
- Category filters
- Veg/Non-veg filters
- Shopping cart
- Search functionality (if implemented)

### Admin App (http://localhost:5174):
- Menu Management page (Super Admin only)
- Full CRUD operations
- Visual card-based interface
- Modal forms for add/edit

---

**Note:** All menu items are stored in MongoDB Atlas cloud database and are accessible from both user and admin applications in real-time!
