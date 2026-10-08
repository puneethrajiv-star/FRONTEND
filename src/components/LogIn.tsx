import AuthScreen from "./AuthScreen";
import type { Navigate } from "./types";

export default function LogIn({ navigate }: { navigate: Navigate }) {
  return <AuthScreen mode="login" navigate={navigate} />;
}
