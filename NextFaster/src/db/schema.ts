import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: varchar("phone", { length: 20 }).notNull().default(""),
  location: text("location"),
  governorate: varchar("governorate", { length: 100 }),
  locationDetail: text("location_detail"),
  isStoreOwner: integer("is_store_owner").notNull().default(0), // 0=buyer, 1=seller
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────
// STORE CATEGORIES (type of store: Restaurant, Fashion, etc.)
// ─────────────────────────────────────────────
export const storeCategories = pgTable("store_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type StoreCategory = typeof storeCategories.$inferSelect;
export type NewStoreCategory = typeof storeCategories.$inferInsert;

// ─────────────────────────────────────────────
// STORES
// ─────────────────────────────────────────────
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  storeName: varchar("store_name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().default(''),
  storeDescription: text("store_description"),
  storeCategoryId: integer("store_category_id")
    .notNull()
    .references(() => storeCategories.id, { onDelete: "restrict" }),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  primaryLocation: varchar("primary_location", { length: 100 }),
  shippingLocations: text("shipping_locations"),
  shippingCost: numeric("shipping_cost"),
  storeLogo: text("store_logo"),
  storeBanner: text("store_banner"),
  businessType: varchar("business_type", { length: 50 }),
  taxId: varchar("tax_id", { length: 100 }),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
},
(table) => ({
  userIdIdx: index("stores_user_id_idx").on(table.userId),
  // Fast slug lookup — the key index for public store pages
  slugIdx: index("stores_slug_idx").on(table.slug),
}));

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

// ─────────────────────────────────────────────
// COLLECTIONS  (top-level grouping per store, e.g. "Our Menu")
// ─────────────────────────────────────────────
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
},
(table) => ({
  // Fast lookup of all collections for a store
  storeIdIdx: index("collections_store_id_idx").on(table.storeId),
  // Fast slug lookup scoped to a store
  storeSlugIdx: index("collections_store_slug_idx").on(table.storeId, table.slug),
}));

export type Collection = typeof collections.$inferSelect;

// ─────────────────────────────────────────────
// CATEGORIES  (e.g. "Burgers", "Drinks")
// ─────────────────────────────────────────────
export const categories = pgTable(
  "categories",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    collection_id: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    collectionIdIdx: index("categories_collection_id_idx").on(table.collection_id),
    // Fast lookup of all categories for a store
    storeIdIdx: index("categories_store_id_idx").on(table.storeId),
    // Composite: store + collection for browsing
    storeCollectionIdx: index("categories_store_collection_idx").on(table.storeId, table.collection_id),
  }),
);

export type Category = typeof categories.$inferSelect;

// ─────────────────────────────────────────────
// SUBCOLLECTIONS  (grouping within a category, e.g. "Hot Drinks")
// Auto-created when seller adds a category — hidden from simple stores
// ─────────────────────────────────────────────
export const subcollections = pgTable(
  "subcollections",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    category_slug: text("category_slug")
      .notNull()
      .references(() => categories.slug, { onDelete: "cascade" }),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
  },
  (table) => ({
    categorySlugIdx: index("subcollections_category_slug_idx").on(table.category_slug),
    storeIdIdx: index("subcollections_store_id_idx").on(table.storeId),
    // Composite: store + category for fast category page loads
    storeCategoryIdx: index("subcollections_store_category_idx").on(table.storeId, table.category_slug),
  }),
);

export type Subcollection = typeof subcollections.$inferSelect;

// ─────────────────────────────────────────────
// SUBCATEGORIES  (leaf grouping, e.g. "Coffee", "Juice")
// Auto-created — hidden from simple stores
// ─────────────────────────────────────────────
export const subcategories = pgTable(
  "subcategories",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    subcollection_id: integer("subcollection_id")
      .notNull()
      .references(() => subcollections.id, { onDelete: "cascade" }),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    subcollectionIdIdx: index("subcategories_subcollection_id_idx").on(table.subcollection_id),
    storeIdIdx: index("subcategories_store_id_idx").on(table.storeId),
    // Composite: store + subcollection for fast subcollection page loads
    storeSubcollectionIdx: index("subcategories_store_subcollection_idx").on(table.storeId, table.subcollection_id),
  }),
);

export type Subcategory = typeof subcategories.$inferSelect;

// ─────────────────────────────────────────────
// PRODUCTS  (the actual items for sale)
// ─────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: numeric("price").notNull(),
    subcategory_slug: text("subcategory_slug")
      .notNull()
      .references(() => subcategories.slug, { onDelete: "cascade" }),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
    isActive: integer("is_active").notNull().default(1),
    offerPercentage: integer("offer_percentage").notNull().default(0),
    isOutOfStock: integer("is_out_of_stock").notNull().default(0),
  },
  (table) => ({
    // Full-text search on product name (the NextFaster magic — keep this!)
    nameSearchIndex: index("name_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.name})`,
    ),
    subcategorySlugIdx: index("products_subcategory_slug_idx").on(table.subcategory_slug),
    // Fast lookup of all products for a store
    storeIdIdx: index("products_store_id_idx").on(table.storeId),
    // Composite: store + subcategory — the most common query (product listing page)
    storeSubcategoryIdx: index("products_store_subcategory_idx").on(table.storeId, table.subcategory_slug),
    // Composite: store + active — for filtering active products
    storeActiveIdx: index("products_store_active_idx").on(table.storeId, table.isActive),
  }),
);

export type Product = typeof products.$inferSelect;

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  stores: many(stores),
}));

export const storeCategoriesRelations = relations(storeCategories, ({ many }) => ({
  stores: many(stores),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  user: one(users, {
    fields: [stores.userId],
    references: [users.id],
  }),
  category: one(storeCategories, {
    fields: [stores.storeCategoryId],
    references: [storeCategories.id],
  }),
  collections: many(collections),
  categories: many(categories),
  subcollections: many(subcollections),
  subcategories: many(subcategories),
  products: many(products),
  shippingRates: many(shippingRates),
  packages: many(packages),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  store: one(stores, {
    fields: [collections.storeId],
    references: [stores.id],
  }),
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  collection: one(collections, {
    fields: [categories.collection_id],
    references: [collections.id],
  }),
  store: one(stores, {
    fields: [categories.storeId],
    references: [stores.id],
  }),
  subcollections: many(subcollections),
}));

export const subcollectionRelations = relations(subcollections, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcollections.category_slug],
    references: [categories.slug],
  }),
  store: one(stores, {
    fields: [subcollections.storeId],
    references: [stores.id],
  }),
  subcategories: many(subcategories),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  subcollection: one(subcollections, {
    fields: [subcategories.subcollection_id],
    references: [subcollections.id],
  }),
  store: one(stores, {
    fields: [subcategories.storeId],
    references: [stores.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategory_slug],
    references: [subcategories.slug],
  }),
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}));

// ─────────────────────────────────────────────
// SHIPPING RATES  (per-governorate pricing per store)
// ─────────────────────────────────────────────
export const shippingRates = pgTable(
  "shipping_rates",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    governorate: varchar("governorate", { length: 100 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    isActive: integer("is_active").notNull().default(1),
  },
  (table) => ({
    storeIdIdx: index("shipping_rates_store_id_idx").on(table.storeId),
    // Unique: one rate per governorate per store
    storeGovernorateIdx: index("shipping_rates_store_governorate_idx").on(
      table.storeId,
      table.governorate,
    ),
  }),
);

export type ShippingRate = typeof shippingRates.$inferSelect;
export type NewShippingRate = typeof shippingRates.$inferInsert;

export const shippingRatesRelations = relations(shippingRates, ({ one }) => ({
  store: one(stores, {
    fields: [shippingRates.storeId],
    references: [stores.id],
  }),
}));


// ─────────────────────────────────────────────────────────────────────────────
// PACKAGES  (bundled products with custom pricing)
// ─────────────────────────────────────────────────────────────────────────────
export const packages = pgTable(
  "packages",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    realPrice: numeric("real_price", { precision: 10, scale: 2 }).notNull(),
    offerPrice: numeric("offer_price", { precision: 10, scale: 2 }).notNull(),
    imageUrl: text("image_url"),
    isActive: integer("is_active").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    storeIdIdx: index("packages_store_id_idx").on(table.storeId),
    storeActiveIdx: index("packages_store_active_idx").on(table.storeId, table.isActive),
  }),
);

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// PACKAGE ITEMS  (products within a package)
// ─────────────────────────────────────────────────────────────────────────────
export const packageItems = pgTable(
  "package_items",
  {
    id: serial("id").primaryKey(),
    packageId: integer("package_id")
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
    productSlug: text("product_slug")
      .notNull()
      .references(() => products.slug, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    packageIdIdx: index("package_items_package_id_idx").on(table.packageId),
    productSlugIdx: index("package_items_product_slug_idx").on(table.productSlug),
  }),
);

export type PackageItem = typeof packageItems.$inferSelect;
export type NewPackageItem = typeof packageItems.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const packagesRelations = relations(packages, ({ one, many }) => ({
  store: one(stores, {
    fields: [packages.storeId],
    references: [stores.id],
  }),
  items: many(packageItems),
}));

export const packageItemsRelations = relations(packageItems, ({ one }) => ({
  package: one(packages, {
    fields: [packageItems.packageId],
    references: [packages.id],
  }),
  product: one(products, {
    fields: [packageItems.productSlug],
    references: [products.slug],
  }),
}));

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
    customerLocation: text("customer_location").notNull(),
    notes: text("notes"),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    shippingFee: numeric("shipping_fee", { precision: 10, scale: 2 }).notNull(),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_orders_store_id").on(table.storeId),
    index("idx_orders_user_id").on(table.userId),
    index("idx_orders_status").on(table.status),
  ]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// ─────────────────────────────────────────────
// ORDER ITEMS
// ─────────────────────────────────────────────
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    itemType: varchar("item_type", { length: 50 }).notNull(), // 'product' or 'package'
    productSlug: varchar("product_slug", { length: 255 }),
    packageId: integer("package_id"),
    name: varchar("name", { length: 255 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [index("idx_order_items_order_id").on(table.orderId)]
);

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────
export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

// ─────────────────────────────────────────────
// STORE AGREEMENTS (terms accepted during store creation)
// ─────────────────────────────────────────────
export const storeAgreements = pgTable(
  "store_agreements",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    agreedAt: timestamp("agreed_at").notNull().defaultNow(),
    ipAddress: varchar("ip_address", { length: 100 }),
    termsVersion: varchar("terms_version", { length: 20 }).notNull().default("1.0"),
    platformFeeAtAgreement: numeric("platform_fee_at_agreement", { precision: 10, scale: 2 }).notNull().default("0"),
  },
  (table) => ({
    storeIdIdx: index("idx_store_agreements_store_id").on(table.storeId),
    userIdIdx: index("idx_store_agreements_user_id").on(table.userId),
  }),
);

export type StoreAgreement = typeof storeAgreements.$inferSelect;
export type NewStoreAgreement = typeof storeAgreements.$inferInsert;

export const storeAgreementsRelations = relations(storeAgreements, ({ one }) => ({
  store: one(stores, {
    fields: [storeAgreements.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [storeAgreements.userId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────
// SOUQFLOW ADMINS
// ─────────────────────────────────────────────
export const souqflowAdmins = pgTable(
  "souqflow_admins",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password_hash").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("souqflow_admins_email_idx").on(table.email),
  }),
);

export type SouqflowAdmin = typeof souqflowAdmins.$inferSelect;
export type NewSouqflowAdmin = typeof souqflowAdmins.$inferInsert;

// ─────────────────────────────────────────────
// SOUQFLOW SETTINGS
// ─────────────────────────────────────────────
export const souqflowSettings = pgTable("souqflow_settings", {
  id: serial("id").primaryKey(),
  platformFeePerOrder: numeric("platform_fee_per_order", { precision: 10, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => souqflowAdmins.id, { onDelete: "set null" }),
});

export type SouqflowSettings = typeof souqflowSettings.$inferSelect;
export type NewSouqflowSettings = typeof souqflowSettings.$inferInsert;

// ─────────────────────────────────────────────
// STORE ANALYTICS (day/week/month)
// ─────────────────────────────────────────────
export const storeAnalytics = pgTable(
  "store_analytics",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    period: varchar("period", { length: 50 }).notNull(), // 'day', 'week', 'month'
    totalOrders: integer("total_orders").notNull().default(0),
    totalSubtotal: numeric("total_subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
    totalPlatformFees: numeric("total_platform_fees", { precision: 10, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    storeIdIdx: index("store_analytics_store_id_idx").on(table.storeId),
    dateIdx: index("store_analytics_date_idx").on(table.date),
    periodIdx: index("store_analytics_period_idx").on(table.period),
    uniqueIdx: index("store_analytics_unique_idx").on(table.storeId, table.date, table.period),
  }),
);

export type StoreAnalytics = typeof storeAnalytics.$inferSelect;
export type NewStoreAnalytics = typeof storeAnalytics.$inferInsert;

// ─────────────────────────────────────────────
// PRODUCT ANALYTICS (top-selling products)
// ─────────────────────────────────────────────
export const productAnalytics = pgTable(
  "product_analytics",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    productSlug: text("product_slug")
      .notNull()
      .references(() => products.slug, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    period: varchar("period", { length: 50 }).notNull(), // 'day', 'week', 'month'
    quantitySold: integer("quantity_sold").notNull().default(0),
    revenue: numeric("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    storeIdIdx: index("product_analytics_store_id_idx").on(table.storeId),
    productSlugIdx: index("product_analytics_product_slug_idx").on(table.productSlug),
    dateIdx: index("product_analytics_date_idx").on(table.date),
    uniqueIdx: index("product_analytics_unique_idx").on(table.storeId, table.productSlug, table.date, table.period),
  }),
);

export type ProductAnalytics = typeof productAnalytics.$inferSelect;
export type NewProductAnalytics = typeof productAnalytics.$inferInsert;

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────
export const souqflowSettingsRelations = relations(souqflowSettings, ({ one }) => ({
  updatedByAdmin: one(souqflowAdmins, {
    fields: [souqflowSettings.updatedBy],
    references: [souqflowAdmins.id],
  }),
}));

export const storeAnalyticsRelations = relations(storeAnalytics, ({ one }) => ({
  store: one(stores, {
    fields: [storeAnalytics.storeId],
    references: [stores.id],
  }),
}));

export const productAnalyticsRelations = relations(productAnalytics, ({ one }) => ({
  store: one(stores, {
    fields: [productAnalytics.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [productAnalytics.productSlug],
    references: [products.slug],
  }),
}));
