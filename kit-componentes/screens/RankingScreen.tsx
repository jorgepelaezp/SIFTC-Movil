
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import type { Entidad } from "../models";
import { getEntidades } from "../services/mercado";
import { TopList } from "../components/ListaTop";

type RankingScreenProps = {
  onSeleccionarEntidad: (entidadId: string | number) => void;
};

export default function RankingScreen({
  onSeleccionarEntidad,
}: RankingScreenProps) {
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    getEntidades()
      .then((datos) => {
        if (activo) {
          setEntidades(datos);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (activo) {
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo cargar el ranking."
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ranking del mercado</Text>
      <Text style={styles.subtitle}>
        Selecciona una entidad para consultar sus gráficas.
      </Text>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : entidades.length === 0 ? (
        <Text style={styles.empty}>
          No hay entidades disponibles.
        </Text>
      ) : (
        <TopList
          title="Clasificación por índice"
          entidades={[...entidades].sort(
            (a, b) => b.indice - a.indice
          )}
          onPressEntidad={(entidad) =>
            onSeleccionarEntidad(entidad.id)
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0D253A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
  },
  error: {
    color: "#BA1A1A",
  },
  empty: {
    color: "#64748B",
  },
});
