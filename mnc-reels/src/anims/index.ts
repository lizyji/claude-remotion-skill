// Registro de animaciones a la medida (B-roll tipo "anim" y golpes tipo "pregunta").
// Cada reel agrega aquí su archivo. id = "<slug>/<clave>".
import type React from "react";
import { ANIMS_PEDIDO, GOLPES_PEDIDO } from "./pedidoEspera";

// dur: duración del clip en cuadros · start: segundo (del video recortado) en que empieza el clip
export type AnimProps = { dur: number; start: number };

export const ANIMS: Record<string, React.FC<AnimProps>> = { ...ANIMS_PEDIDO };
export const GOLPES: Record<string, React.FC<AnimProps>> = { ...GOLPES_PEDIDO };
