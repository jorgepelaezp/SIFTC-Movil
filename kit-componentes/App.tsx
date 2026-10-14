import { useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import {
  Button,
  TextField,
  LoadingIndicator,
  ErrorMessage,
  ErrorType,
} from "./components";
import { colors, spacing } from "./theme";

export default function App() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<ErrorType | null>(null);
  const [loading, setLoading] = useState(false);

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
          onPress={() => setLoading(!loading)}
          loading={loading}
        />

        <View style={styles.demo}>
          <Button
            title="Probar error de credenciales"
            onPress={() => setError("credenciales")}
          />
          <View style={{ height: spacing.sm }} />
          <Button
            title="Probar error sin conexión"
            onPress={() => setError("sinConexion")}
          />
          <View style={{ height: spacing.sm }} />
          <Button title="Quitar error" onPress={() => setError(null)} />
        </View>

        {loading && <LoadingIndicator />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, marginTop: spacing.lg },
  demo: { marginTop: spacing.lg },
});
