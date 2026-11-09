export type DefusalTaskType =
  | 'wire-connect'
  | 'keypad-math'
  | 'cut-wires'
  | 'extinguish-fire'
  | 'break-glass'
  | 'sliders'
  | 'rotary-dials';

export interface WireColor {
  id: string;
  name: string;
  color: string;
  glow: string;
  symbol: string;
}

export const WIRE_COLORS: WireColor[] = [
  { id: 'red', name: 'Rood', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)', symbol: '●' },
  { id: 'blue', name: 'Blauw', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)', symbol: '■' },
  { id: 'yellow', name: 'Geel', color: '#eab308', glow: 'rgba(234, 179, 8, 0.6)', symbol: '▲' },
  { id: 'green', name: 'Groen', color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', symbol: '★' },
  { id: 'purple', name: 'Paars', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)', symbol: '◆' },
];
