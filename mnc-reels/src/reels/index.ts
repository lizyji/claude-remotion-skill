// Registro de animaciones a medida por reel ("tipo": "custom" en reel.json → id).
import type React from "react";
import { IA_EMPRESA_HERRAMIENTA } from "./iaEmpresaHerramienta";

export type CustomProps = { marcas: number[]; dur: number }; // marcas en cuadros, relativos al inicio del clip

export const CUSTOM: Record<string, React.FC<CustomProps>> = {
  ...IA_EMPRESA_HERRAMIENTA,
};
