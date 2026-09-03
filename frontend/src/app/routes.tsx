import { createHashRouter } from "react-router";
import Home from "./pages/Home";
import PackageDetail from "./pages/PackageDetail";
import Packages from "./pages/Packages";
import PlanTrip from "./pages/PlanTrip";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import Admin from "./pages/Admin";

export const router = createHashRouter([
  { path: "/", Component: Home },
  { path: "/packages", Component: Packages },
  { path: "/destinations", Component: Packages },
  { path: "/plan-trip", Component: PlanTrip },
  { path: "/package/:id", Component: PackageDetail },
  { path: "/checkout", Component: Checkout },
  { path: "/order-success", Component: OrderSuccess },
  { path: "/my-orders", Component: MyOrders },
  { path: "/admin", Component: Admin },
  { path: "*", Component: Home },
]);
