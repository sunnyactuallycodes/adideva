import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { StoreProvider } from "./store";
import { AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <RouterProvider router={router} />
        <AuthModal />
        <Toaster position="top-right" richColors closeButton />
      </StoreProvider>
    </AuthProvider>
  );
}
