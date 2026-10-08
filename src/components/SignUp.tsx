import AuthScreen from "./AuthScreen";
import type { Navigate } from "./types";

export default function SignUp({ navigate }: { navigate: Navigate }) {
  return <AuthScreen mode="signup" navigate={navigate} />;
}
