import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";
import { ADMIN_SECRET_PATH } from "./config/adminConfig";

export default [
  // Storefront Layout & Public Pages
  layout("routes/_storefront.tsx", [
    index("routes/_storefront._index.tsx"),
    route("shop", "routes/_storefront.shop.tsx"),
    route("product/:slug", "routes/_storefront.product.$slug.tsx"),
    route("checkout", "routes/_storefront.checkout.tsx"),
    route("order/success/:id", "routes/_storefront.order.$id.tsx"),
    route("account", "routes/_storefront.account.tsx"),
    route("contact", "routes/_storefront.contact.tsx"),
    route("login", "routes/_storefront.login.tsx"),
    route("register", "routes/_storefront.register.tsx"),
    route("static/:page", "routes/_storefront.static.$page.tsx"),

    // Decoy 404 for guessed admin URLs (protects admin obscurity)
    route("admin/*?", "routes/decoy.admin.tsx"),
  ]),

  // Staff Portal (Accessed via /deshboard or /dashboard)
  route("deshboard", "routes/deshboard.tsx"),
  route("dashboard", "routes/staff.portal.tsx"),

  // Secret Administration Vault (Unguessable disguised path)
  layout("routes/admin.tsx", [
    route(ADMIN_SECRET_PATH, "routes/admin._index.tsx"),
    route(`${ADMIN_SECRET_PATH}/products`, "routes/admin.products.tsx"),
    route(`${ADMIN_SECRET_PATH}/products/new`, "routes/admin.product.new.tsx"),
    route(`${ADMIN_SECRET_PATH}/products/:id/edit`, "routes/admin.product.edit.tsx"),
    route(`${ADMIN_SECRET_PATH}/orders`, "routes/admin.orders.tsx"),
    route(`${ADMIN_SECRET_PATH}/sourcing`, "routes/admin.sourcing.tsx"),
    route(`${ADMIN_SECRET_PATH}/inventory`, "routes/admin.inventory.tsx"),
    route(`${ADMIN_SECRET_PATH}/customers`, "routes/admin.customers.tsx"),
    route(`${ADMIN_SECRET_PATH}/delivery`, "routes/admin.delivery.tsx"),
    route(`${ADMIN_SECRET_PATH}/payments`, "routes/admin.payments.tsx"),
    route(`${ADMIN_SECRET_PATH}/marketing`, "routes/admin.marketing.tsx"),
    route(`${ADMIN_SECRET_PATH}/support`, "routes/admin.support.tsx"),
    route(`${ADMIN_SECRET_PATH}/reviews`, "routes/admin.reviews.tsx"),
    route(`${ADMIN_SECRET_PATH}/reports`, "routes/admin.reports.tsx"),
    route(`${ADMIN_SECRET_PATH}/settings`, "routes/admin.settings.tsx"),
  ]),
] satisfies RouteConfig;
