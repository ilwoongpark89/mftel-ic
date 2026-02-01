export interface ChipPreset {
  name: string;
  tdp: number; // W
  area: number; // mm²
  category: string;
}

export const chipPresets: ChipPreset[] = [
  { name: "NVIDIA H100 SXM", tdp: 700, area: 814, category: "Data Center" },
  { name: "NVIDIA H200 SXM", tdp: 700, area: 814, category: "Data Center" },
  { name: "NVIDIA A100 SXM", tdp: 400, area: 826, category: "Data Center" },
  { name: "NVIDIA B200", tdp: 1000, area: 900, category: "Data Center" },
  { name: "NVIDIA GB200 (dual)", tdp: 2700, area: 900, category: "Data Center" },
  { name: "NVIDIA RTX 4090", tdp: 450, area: 608, category: "Consumer" },
  { name: "NVIDIA RTX 5090", tdp: 575, area: 750, category: "Consumer" },
  { name: "NVIDIA RTX 4080", tdp: 320, area: 379, category: "Consumer" },
  { name: "AMD MI300X", tdp: 750, area: 750, category: "Data Center" },
  { name: "AMD MI325X", tdp: 750, area: 750, category: "Data Center" },
  { name: "Intel Gaudi 3", tdp: 600, area: 600, category: "Data Center" },
  { name: "Google TPU v5e", tdp: 200, area: 400, category: "Data Center" },
  { name: "Custom", tdp: 300, area: 500, category: "Custom" },
];
