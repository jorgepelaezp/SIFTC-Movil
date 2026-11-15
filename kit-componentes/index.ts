import { createElement } from "react";
import { registerRootComponent } from "expo";
import { SafeAreaProvider } from "react-native-safe-area-context";

import App from "./App";
import { ProveedorTema } from "./theme/TemaContext";

// Envuelve la app con el tema (claro/oscuro) y la zona segura de la pantalla.
function Raiz() {
  return createElement(SafeAreaProvider, {
    children: createElement(ProveedorTema, { children: createElement(App) }),
  });
}

registerRootComponent(Raiz);