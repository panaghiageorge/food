// src/graphql/schema.js
export const schema = `
type Category {
  id: ID!
  name: String!
  restaurantId: ID
  products: [Product!]!
  restaurant: Restaurant
}

type ProductOption {
  id: ID!
  name: String!
  label: String
  type: String
}

type ProductOptionValue {
  id: ID!
  value: String!
  optionId: ID!
}

type Product {
  id: ID!
  name: String!
  price: Float!
  categoryId: ID!
  image_url: String
  restaurantId: ID!
  restaurant: Restaurant
  category: Category
  created_at: String
}

type Restaurant {
  id: ID!
  name: String!
  description: String
  address: String!
  imageUrl: String
  categories: [Category!]
  products: [Product!]
}

type User {
  id: ID!
  email: String!
  name: String
  role: String 
}

type AuthPayload {
  token: String!
  user: User
}

type RefreshResponse {
  token: String!
}

type CartItem {
  id: ID!
  product: Product!
  quantity: Int!
  optionValues: [ProductOptionValue!]!
}

type OrderStatus {
  id: Int!
  name: String!
}

type Order {
  id: ID!
  status: Int!
  statusInfo: OrderStatus!
  items: [OrderItem!]!
}

type OrderItem {
  id: ID!
  product: Product!
  quantity: Int!
  optionValues: [ProductOptionValue!]!
}

type ProductSearchResult {
  items: [Product!]!
  totalCount: Int!
}

type OrderSearchResult {
  items: [Order!]!
  totalCount: Int!
}


type Query {
  categories: [Category!]!
  products: [Product!]!
  restaurants: [Restaurant!]!
  productOptions: [ProductOption!]!
  productOptionValues: [ProductOptionValue!]!
  profile: User
  getCart: [CartItem!]!
  getAllOrders(limit: Int, offset: Int): OrderSearchResult!
  myOrders(
    limit: Int
    offset: Int 
    status: Int
    startDate: String
    endDate: String
  ): OrderSearchResult!
  getAllRestaurants: [Restaurant!]!
  getProductsByRestaurant(restaurantId: ID!): [Product!]!
  getCategoriesByRestaurant(restaurantId: ID!): [Category!]!
  getProductsByCategory(categoryId: ID!): [Product!]!
  getMenuByRestaurant(restaurantId: ID!): [Category!]!
  searchProducts(
    term: String
    restaurantId: ID
    categoryId: ID
    maxPrice: Float
    orderBy: String
    orderDir: String
    limit: Int
    offset: Int
  ): ProductSearchResult!
}

type Mutation {
  register(email: String!, password: String!, name: String, role: String ): User
  login(email: String!, password: String!): AuthPayload
  refreshToken(refreshToken: String!): RefreshResponse!
  logout(refreshToken: String!): Boolean!

  createProduct(name: String!, price: Float!, imageUrl: String, restaurantId: ID!, categoryId: ID!): Product
  updateProduct(id: ID!, name: String, price: Float, imageUrl: String): Product
  deleteProduct(id: ID!): Boolean

  createCategory(name: String!): Category
  createProductOption(name: String!, label: String!, type: String!): ProductOption
  createProductOptionValue(value: String!, optionId: ID!): ProductOptionValue
  
  addToCart(productId: ID!, quantity: Int!, optionValueIds: [ID!]): CartItem
  placeOrder: Order!
  updateOrderStatus(orderId: ID!, status: Int!): Order
  cancelOrder(orderId: ID!): Boolean!
  
  createRestaurant(name: String!, address: String!, imageUrl: String): Restaurant!
  updateOrderStatusName(id: Int!, name: String!): OrderStatus
}

`;
