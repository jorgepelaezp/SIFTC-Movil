import { useState } from "react";
import { Alert, SafeAreaView, View, StyleSheet } from "react-native";
import {
  Button,
  TextField,
  LoadingIndicator,
  ErrorMessage,
  ErrorType,
} from "./components";
import { colors, spacing } from "./theme";
import { login, BASE_URL } from "./services/api";

export default function App() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<ErrorType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const result = await login(user.trim(), pass);
    setLoading(false);

    if (!result.ok) {
      Alert.alert("Debug", String(BASE_URL) + " | " + JSON.stringify(result));
      setError(result.error);
      return;
    }

    // Aquí Alejandro enchufará el guardado seguro del token (CA2)
    console.log("Login OK, token:", result.token);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        {error && <ErrorMessage type={error} />}
        <TextField
          label="Usuario"
          value={user}
          onChangeText={setUser}
          error={error === "credenciales"}
        />
        <TextField
          label="Contraseña"
          value={pass}
          onChangeText={setPass}
          secureTextEntry
          error={error === "credenciales"}
        />
        <Button
          title="Ingresar"
          onPress={handleLogin}
          loading={loading}
          disabled={!user || !pass}
        />

        {loading && <LoadingIndicator />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, marginTop: spacing.lg },
});