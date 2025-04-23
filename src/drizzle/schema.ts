//all db configuration

import { subscriptionTiers, TierNames } from "@/data/subscriptionTiers";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

const createdAt = timestamp("created_at",{ withTimezone: true })
  .notNull()
  .defaultNow() /* timestamp variablestimezone makes it easy to update db */
const updatedAt = timestamp("updated_at",{ withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate (()=> new Date())/* autp updates timezone per db updates */

//create product table
export const ProductTable = pgTable(
  "products", 
  {
    id: uuid("id").primaryKey().defaultRandom(), /* product id */
    clerkUserId: text("clerk_user_id").notNull(), /* all products linked to a user which is not null*/
    name: text("name").notNull(), /*  */
    url: text("url").notNull(),
    description: text("description"),
    createdAt, /* create variable because they apply to all tables */
    updatedAt,
  }, 
  table => ({ /* add index to access data based on specific field with index like clerkuserid so its faster*/
    clerkUserIdIdx: index("clerk_user_id_index").on(
      table.clerkUserId /* what table is it going ot be on */
    ),
  })
);

//modify as more relationships are added
export const productRelations = relations(ProductTable, ({ one, many }) => ({ /* what kind of relatiomships you can have, or or many */
  productCustomization: one(ProductCustomizationTable), /* each product has one customization */
  productViews: many(ProductViewTable), /* go down and create relationships in productviewtable */
  countryGroupDiscounts: many(CountryGroupDiscountTable),
})); /* all associations on prod table and takes in a function */

//product customization table, because there's a feature to cutomize banner
export const ProductCustomizationTable = pgTable("product_customizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  classPrefix: text("class_prefix"), 
  productId: uuid("product_id")
    .notNull()
    .references(() => ProductTable.id, { onDelete: "cascade" })/* if delete product also delete customization asscoated */
    .unique(), /* design: each prod can only have one cust table b/c each product has one row */
  locationMessage: text("location_message") /* customize messages */
    .notNull()
    .default(
      "Hey! It looks like you are from <b>{country}</b>. We support Parity Purchasing Power, so if you need it, use code <b>“{coupon}”</b> to get <b>{discount}%</b> off."
    ),
  backgroundColor: text("background_color") /* customize background color */
    .notNull()
    .default("hsl(193, 82%, 31%)"),
  textColor: text("text_color").notNull().default("hsl(0, 0%, 100%)"),
  fontSize: text("font_size").notNull().default("1rem"),
  bannerContainer: text("banner_container").notNull().default("body"),
  isSticky: boolean("is_sticky").notNull().default(true), /* sticky to the top of the page */
  createdAt,
  updatedAt,
});

export const productCustomizationRelations = relations(
  ProductCustomizationTable, 
  ({ one }) => ({
    product: one(ProductTable, {
    fields:[ProductCustomizationTable.productId], /* foreign key product id */
    references:[ProductTable.id] /* create easy join queries */
    }),
  })
) 

export const ProductViewTable = pgTable("product_views", { /* what product am I viewing which table am I viewing from, when did I viewed that */
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => ProductTable.id, { onDelete: "cascade" }), /* how many times wach product has been viewed to limit service */
  countryId: uuid("country_id").references(() => CountryTable.id, { 
    onDelete: "cascade",
   }),
  visitedAt: timestamp("visited_at", { withTimezone:true })
   .notNull()
   .defaultNow(),
})

export const productViewRelations = relations(ProductViewTable, ({ one }) => ({
  product: one(ProductTable,{
    fields: [ProductViewTable.productId],
    references: [ProductTable.id]
  }), /* 1:1 relationship between product and country*/
  country: one(CountryTable, {
    fields:[ProductViewTable.countryId],
    references: [CountryTable.id],
  }),
}))

export const CountryTable = pgTable("countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  countryGroupId: uuid("country_group_id") /* group diff contries todether for 10%, 30%, 50% coupons to sort */
  .notNull()
    .references(() => CountryGroupTable.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt,
})

export const countryRelations = relations(CountryTable, ({ many, one }) => ({
  countryGroups: one(CountryGroupTable, {
    fields: [CountryTable.countryGroupId],
    references: [CountryGroupTable.id]
  }), /* single contry group but many views in product table */
  productViews: many(ProductViewTable),
}))

export const CountryGroupTable = pgTable("country_group", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  recommendedDiscountPercentage: real("recommended_discount_percentage"),
  createdAt,
  updatedAt,
})

export const CountryGroupRelations = relations(
  CountryGroupTable,
  ({ many }) => ({
    countries: many(CountryTable),
    countryGroupDiscounts: many(CountryGroupDiscountTable)
  })
)

export const CountryGroupDiscountTable = pgTable(
  "country_group_discounts",
  {
    countryGroupId: uuid("country_group_id") /* reference country group table */
      .notNull()
      .references(() => CountryGroupTable.id, { onDelete: "cascade" }),
    productId: uuid("product_id") /* reference product table using product_id */
      .notNull()
      .references(() => ProductTable.id, { onDelete: "cascade" }),
    coupon: text("coupon").notNull(), /* ubduvudual user saves a particular coupon for a particular group*/
    discountPercentage: real("discount_percentage").notNull(),
    createdAt,
    updatedAt,
  },
  table => ({
    pk:primaryKey({columns: [table.countryGroupId, table.productId]}), /* can only have one discount code and one coupon for this combo */
  })
    )

export const countryGroupDiscountRelations = relations(
  CountryGroupDiscountTable,
  ({ one }) => ({
    product: one(ProductTable, { /* one product */
      fields: [CountryGroupDiscountTable.productId],
      references: [ProductTable.id],
    }),
    countryGroup: one(CountryGroupTable, { /* to one country group */
      fields: [CountryGroupDiscountTable.countryGroupId],
      references: [CountryGroupTable.id],
    }),
  })
)

export const TierEnum = pgEnum( /* get based on all subs tiers all of different keys of strings just the names */
  "tier",
  Object.keys(subscriptionTiers) as [TierNames] /* go create tiernames type on the top */
)

export const UserSubscriptionTable = pgTable(
  "user_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    stripeSubscriptionItemId: text("stripe_subscription_item_id"), /* so that users can change their subscription which out having to sign up for multiple subs */
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeCustomerId: text("stripe_customer_id"),
    tier: TierEnum("tier").notNull(),
    createdAt,
    updatedAt,
  },
  table => ({
    clerkUserIdIndex: index("user_subscriptions.clerk_user_id_index").on( /* walways going to create subs with users id or stripe */
      table.clerkUserId
    ),
    stripeCustomerIdIndex: index(
      "user_subscriptions.stripe_customer_id_index"
    ).on(table.stripeCustomerId),
  })
)