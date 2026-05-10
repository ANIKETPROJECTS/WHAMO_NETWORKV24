export interface TurbineCurvePoint {
  head: number;
  q: number;
  torque: number;
}

export interface TurbineCurveGate {
  gatePercent: number;
  points: TurbineCurvePoint[];
}

export interface TurbineNsGroup {
  nsUS: number;
  nsSI: number;
  label: string;
  headRange: string;
  gates: TurbineCurveGate[];
}

export const TURBINE_CURVE_LIBRARY: TurbineNsGroup[] = [
  {
    nsUS: 30, nsSI: 115,
    label: 'Ns 30 (US) / 115 (SI)',
    headRange: 'SI 111–178, US 25–40',
    gates: [
      { gatePercent: 20, points: [
        { head: 260.19, q: 69.27,  torque: 86.12  },
        { head: 240.02, q: 63.65,  torque: 78.01  },
        { head: 220.04, q: 58.03,  torque: 69.97  },
        { head: 200.14, q: 52.42,  torque: 62.04  },
        { head: 179.97, q: 46.81,  torque: 53.99  },
        { head: 160.12, q: 41.2,   torque: 46.12  },
        { head: 140.06, q: 35.58,  torque: 37.96  },
        { head: 119.97, q: 30.04,  torque: 29.99  },
        { head: 99.92,  q: 24.45,  torque: 21.98  },
        { head: 79.99,  q: 18.8,   torque: 14.0   },
        { head: 60.0,   q: 13.15,  torque: 6.0    },
        { head: 40.05,  q: 7.59,   torque: -2.0   },
        { head: 19.99,  q: 1.98,   torque: -9.99  },
      ]},
      { gatePercent: 30, points: [
        { head: 259.92, q: 96.35,  torque: 138.54 },
        { head: 240.14, q: 89.28,  torque: 125.83 },
        { head: 220.01, q: 82.0,   torque: 113.09 },
        { head: 199.71, q: 74.73,  torque: 100.06 },
        { head: 180.25, q: 67.65,  torque: 87.6   },
        { head: 160.16, q: 60.46,  torque: 74.64  },
        { head: 140.09, q: 53.18,  torque: 61.78  },
        { head: 119.91, q: 45.96,  torque: 48.92  },
        { head: 99.91,  q: 38.76,  torque: 36.17  },
        { head: 80.01,  q: 31.57,  torque: 23.36  },
        { head: 60.09,  q: 24.45,  torque: 10.64  },
        { head: 39.97,  q: 17.25,  torque: -2.2   },
        { head: 20.0,   q: 10.01,  torque: -15.0  },
      ]},
      { gatePercent: 40, points: [
        { head: 260.45, q: 113.1,  torque: 187.79 },
        { head: 239.82, q: 105.0,  torque: 170.03 },
        { head: 219.98, q: 96.93,  torque: 152.89 },
        { head: 199.68, q: 88.92,  torque: 135.58 },
        { head: 180.16, q: 81.0,   torque: 118.72 },
        { head: 160.16, q: 73.03,  torque: 101.54 },
        { head: 140.06, q: 65.06,  torque: 84.18  },
        { head: 120.04, q: 56.96,  torque: 66.98  },
        { head: 100.02, q: 49.02,  torque: 49.81  },
        { head: 80.06,  q: 40.96,  torque: 32.67  },
        { head: 60.07,  q: 33.01,  torque: 15.44  },
        { head: 40.05,  q: 24.98,  torque: -1.8   },
        { head: 20.01,  q: 17.04,  torque: -19.01 },
      ]},
      { gatePercent: 50, points: [
        { head: 260.09, q: 133.47, torque: 232.52 },
        { head: 240.14, q: 124.17, torque: 211.33 },
        { head: 219.75, q: 114.94, torque: 189.86 },
        { head: 199.92, q: 105.85, torque: 168.73 },
        { head: 179.91, q: 96.54,  torque: 147.53 },
        { head: 159.73, q: 87.32,  torque: 126.19 },
        { head: 140.01, q: 78.22,  torque: 105.15 },
        { head: 120.07, q: 68.97,  torque: 84.05  },
        { head: 99.92,  q: 59.78,  torque: 62.75  },
        { head: 80.01,  q: 50.65,  torque: 41.61  },
        { head: 60.07,  q: 41.43,  torque: 20.42  },
        { head: 40.01,  q: 32.23,  torque: -0.8   },
        { head: 20.01,  q: 22.97,  torque: -22.01 },
      ]},
      { gatePercent: 60, points: [
        { head: 259.59, q: 161.29, torque: 273.09 },
        { head: 240.53, q: 150.33, torque: 249.43 },
        { head: 219.68, q: 138.9,  torque: 223.63 },
        { head: 199.75, q: 127.79, torque: 198.95 },
        { head: 179.79, q: 116.58, torque: 174.22 },
        { head: 160.18, q: 105.42, torque: 149.77 },
        { head: 139.98, q: 94.25,  torque: 124.72 },
        { head: 120.03, q: 83.0,   torque: 99.98  },
        { head: 99.94,  q: 71.81,  torque: 75.15  },
        { head: 80.01,  q: 60.6,   torque: 50.41  },
        { head: 59.91,  q: 49.4,   torque: 25.58  },
        { head: 40.02,  q: 38.19,  torque: 0.8    },
        { head: 20.02,  q: 27.01,  torque: -24.03 },
      ]},
      { gatePercent: 70, points: [
        { head: 259.49, q: 173.04, torque: 308.28 },
        { head: 239.99, q: 161.65, torque: 281.03 },
        { head: 220.13, q: 150.0,  torque: 253.15 },
        { head: 199.71, q: 138.31, torque: 224.67 },
        { head: 179.98, q: 126.74, torque: 196.9  },
        { head: 159.89, q: 115.17, torque: 168.84 },
        { head: 140.01, q: 103.54, torque: 140.99 },
        { head: 119.96, q: 92.01,  torque: 113.0  },
        { head: 99.85,  q: 80.34,  torque: 84.87  },
        { head: 80.05,  q: 68.82,  torque: 56.99  },
        { head: 59.95,  q: 57.23,  torque: 28.96  },
        { head: 39.94,  q: 45.6,   torque: 1.0    },
        { head: 19.96,  q: 34.01,  torque: -26.95 },
      ]},
      { gatePercent: 80, points: [
        { head: 259.62, q: 178.36, torque: 331.54 },
        { head: 239.9,  q: 167.2,  torque: 301.79 },
        { head: 219.78, q: 156.01, torque: 271.65 },
        { head: 200.4,  q: 144.92, torque: 242.49 },
        { head: 179.8,  q: 133.47, torque: 211.8  },
        { head: 159.89, q: 122.4,  torque: 181.79 },
        { head: 140.07, q: 111.29, torque: 152.11 },
        { head: 120.22, q: 100.08, torque: 122.26 },
        { head: 100.01, q: 88.74,  torque: 92.01  },
        { head: 80.07,  q: 77.58,  torque: 62.05  },
        { head: 59.92,  q: 66.35,  torque: 31.94  },
        { head: 40.06,  q: 55.25,  torque: 2.0    },
        { head: 19.97,  q: 44.03,  torque: -27.96 },
      ]},
      { gatePercent: 90, points: [
        { head: 260.68, q: 188.39, torque: 351.13 },
        { head: 239.98, q: 176.7,  torque: 318.45 },
        { head: 220.04, q: 164.95, torque: 287.15 },
        { head: 199.66, q: 153.3,  torque: 254.97 },
        { head: 180.01, q: 141.87, torque: 223.75 },
        { head: 159.78, q: 130.19, torque: 191.89 },
        { head: 139.94, q: 118.48, torque: 160.52 },
        { head: 119.9,  q: 106.91, torque: 128.9  },
        { head: 100.11, q: 95.39,  torque: 97.51  },
        { head: 80.15,  q: 83.85,  torque: 65.88  },
        { head: 60.04,  q: 72.27,  torque: 34.22  },
        { head: 40.02,  q: 60.6,   torque: 2.6    },
        { head: 20.04,  q: 49.02,  torque: -29.06 },
      ]},
      { gatePercent: 100, points: [
        { head: 260.28, q: 199.82, torque: 363.86 },
        { head: 239.94, q: 187.48, torque: 330.64 },
        { head: 220.18, q: 175.06, torque: 298.34 },
        { head: 200.33, q: 162.74, torque: 265.63 },
        { head: 180.44, q: 150.33, torque: 232.95 },
        { head: 159.93, q: 137.73, torque: 199.43 },
        { head: 140.17, q: 125.45, torque: 166.95 },
        { head: 120.13, q: 113.1,  torque: 134.18 },
        { head: 100.0,  q: 100.0,  torque: 100.0  },
        { head: 80.05,  q: 88.2,   torque: 68.44  },
        { head: 59.96,  q: 75.83,  torque: 35.56  },
        { head: 39.97,  q: 63.37,  torque: 2.8    },
        { head: 19.96,  q: 51.02,  torque: -29.95 },
      ]},
    ],
  },
  {
    nsUS: 45, nsSI: 170,
    label: 'Ns 45 (US) / 170 (SI)',
    headRange: 'SI 178–214, US 40–48',
    gates: [
      { gatePercent: 20, points: [
        { head: 259.87, q: 48.4,   torque: 68.87  },
        { head: 239.83, q: 45.23,  torque: 62.6   },
        { head: 220.05, q: 42.14,  torque: 56.33  },
        { head: 200.12, q: 38.99,  torque: 50.03  },
        { head: 179.96, q: 35.8,   torque: 43.73  },
        { head: 159.9,  q: 32.67,  torque: 37.42  },
        { head: 140.11, q: 29.6,   torque: 31.1   },
        { head: 120.01, q: 26.47,  torque: 24.84  },
        { head: 100.01, q: 23.29,  torque: 18.6   },
        { head: 80.03,  q: 20.15,  torque: 12.33  },
        { head: 60.06,  q: 17.04,  torque: 6.01   },
        { head: 39.94,  q: 13.87,  torque: -0.28  },
        { head: 20.03,  q: 10.72,  torque: -6.59  },
      ]},
      { gatePercent: 30, points: [
        { head: 259.99, q: 77.42,  torque: 124.28 },
        { head: 240.15, q: 72.27,  torque: 112.87 },
        { head: 219.7,  q: 67.07,  torque: 101.28 },
        { head: 199.97, q: 61.97,  torque: 89.99  },
        { head: 179.87, q: 56.83,  torque: 78.6   },
        { head: 160.05, q: 51.65,  torque: 67.22  },
        { head: 140.1,  q: 46.57,  torque: 55.76  },
        { head: 120.0,  q: 41.43,  torque: 44.28  },
        { head: 99.97,  q: 36.25,  torque: 32.89  },
        { head: 80.0,   q: 31.13,  torque: 21.44  },
        { head: 60.07,  q: 26.05,  torque: 10.03  },
        { head: 39.99,  q: 20.88,  torque: -1.44  },
        { head: 20.02,  q: 15.71,  torque: -12.87 },
      ]},
      { gatePercent: 40, points: [
        { head: 260.25, q: 92.38,  torque: 170.47 },
        { head: 240.0,  q: 86.79,  torque: 154.8  },
        { head: 220.09, q: 81.5,   torque: 139.53 },
        { head: 200.0,  q: 75.99,  torque: 124.0  },
        { head: 180.01, q: 70.61,  torque: 108.55 },
        { head: 160.13, q: 65.2,   torque: 93.19  },
        { head: 140.11, q: 59.78,  torque: 77.76  },
        { head: 120.13, q: 54.34,  torque: 62.34  },
        { head: 99.92,  q: 48.9,   torque: 46.86  },
        { head: 79.93,  q: 43.44,  torque: 31.41  },
        { head: 59.97,  q: 37.96,  torque: 16.01  },
        { head: 39.95,  q: 32.56,  torque: 0.56   },
        { head: 20.03,  q: 27.12,  torque: -14.89 },
      ]},
      { gatePercent: 50, points: [
        { head: 259.82, q: 120.18, torque: 223.71 },
        { head: 239.85, q: 112.87, torque: 203.39 },
        { head: 220.1,  q: 105.42, torque: 183.35 },
        { head: 200.18, q: 98.1,   torque: 163.14 },
        { head: 179.8,  q: 90.54,  torque: 142.58 },
        { head: 160.17, q: 83.17,  torque: 122.53 },
        { head: 139.85, q: 75.67,  torque: 102.09 },
        { head: 120.04, q: 68.24,  torque: 81.87  },
        { head: 99.95,  q: 60.87,  torque: 61.57  },
        { head: 80.03,  q: 53.44,  torque: 41.3   },
        { head: 60.03,  q: 45.96,  torque: 21.01  },
        { head: 39.98,  q: 38.53,  torque: 0.72   },
        { head: 20.0,   q: 31.13,  torque: -19.58 },
      ]},
      { gatePercent: 60, points: [
        { head: 259.8,  q: 134.87, torque: 274.35 },
        { head: 239.81, q: 127.0,  torque: 249.4  },
        { head: 219.82, q: 118.97, torque: 224.65 },
        { head: 200.32, q: 111.07, torque: 200.32 },
        { head: 180.03, q: 102.92, torque: 175.17 },
        { head: 159.99, q: 95.01,  torque: 150.23 },
        { head: 140.06, q: 86.97,  torque: 125.49 },
        { head: 120.15, q: 79.03,  torque: 100.69 },
        { head: 99.96,  q: 71.06,  torque: 75.67  },
        { head: 80.01,  q: 62.95,  torque: 50.89  },
        { head: 60.05,  q: 54.99,  torque: 26.0   },
        { head: 39.96,  q: 47.05,  torque: 1.16   },
        { head: 20.03,  q: 38.99,  torque: -23.76 },
      ]},
      { gatePercent: 70, points: [
        { head: 260.54, q: 170.67, torque: 308.74 },
        { head: 240.24, q: 159.86, torque: 280.59 },
        { head: 219.64, q: 148.71, torque: 252.36 },
        { head: 200.12, q: 138.02, torque: 225.14 },
        { head: 180.03, q: 127.26, torque: 197.31 },
        { head: 160.19, q: 116.34, torque: 169.8  },
        { head: 139.9,  q: 105.42, torque: 141.72 },
        { head: 120.1,  q: 94.63,  torque: 114.21 },
        { head: 100.03, q: 83.68,  torque: 86.42  },
        { head: 80.04,  q: 72.88,  torque: 58.75  },
        { head: 59.92,  q: 61.97,  torque: 30.98  },
        { head: 39.99,  q: 51.15,  torque: 3.28   },
        { head: 20.01,  q: 40.27,  torque: -24.44 },
      ]},
      { gatePercent: 80, points: [
        { head: 260.02, q: 185.24, torque: 331.27 },
        { head: 240.13, q: 173.44, torque: 301.6  },
        { head: 219.82, q: 161.65, torque: 271.48 },
        { head: 199.76, q: 150.0,  torque: 241.72 },
        { head: 179.96, q: 138.31, torque: 212.18 },
        { head: 159.8,  q: 126.48, torque: 182.33 },
        { head: 140.13, q: 114.94, torque: 153.03 },
        { head: 120.13, q: 103.13, torque: 123.26 },
        { head: 100.02, q: 91.46,  torque: 93.42  },
        { head: 79.88,  q: 79.68,  torque: 63.59  },
        { head: 60.06,  q: 67.94,  torque: 34.05  },
        { head: 39.98,  q: 56.3,   torque: 4.28   },
        { head: 19.94,  q: 44.51,  torque: -25.35 },
      ]},
      { gatePercent: 90, points: [
        { head: 260.28, q: 192.08, torque: 342.01 },
        { head: 239.86, q: 180.04, torque: 310.86 },
        { head: 220.14, q: 167.97, torque: 280.67 },
        { head: 199.92, q: 156.01, torque: 249.9  },
        { head: 179.87, q: 144.0,  torque: 219.26 },
        { head: 160.21, q: 132.09, torque: 189.05 },
        { head: 139.74, q: 119.94, torque: 158.04 },
        { head: 119.91, q: 107.99, torque: 127.58 },
        { head: 99.85,  q: 95.96,  torque: 96.96  },
        { head: 80.05,  q: 84.02,  torque: 66.6   },
        { head: 60.05,  q: 71.97,  torque: 36.03  },
        { head: 39.97,  q: 60.05,  torque: 5.44   },
        { head: 19.99,  q: 48.03,  torque: -25.13 },
      ]},
      { gatePercent: 100, points: [
        { head: 260.19, q: 200.83, torque: 386.91 },
        { head: 239.52, q: 187.93, torque: 350.9  },
        { head: 219.75, q: 175.47, torque: 316.44 },
        { head: 200.44, q: 163.1,  torque: 282.62 },
        { head: 179.96, q: 150.33, torque: 247.08 },
        { head: 159.93, q: 137.73, torque: 212.22 },
        { head: 139.82, q: 125.19, torque: 177.16 },
        { head: 119.92, q: 112.65, torque: 142.46 },
        { head: 100.0,  q: 100.0,  torque: 100.0  },
        { head: 79.97,  q: 87.49,  torque: 72.85  },
        { head: 60.09,  q: 75.05,  torque: 38.04  },
        { head: 39.91,  q: 62.39,  torque: 3.15   },
        { head: 19.98,  q: 49.89,  torque: -31.69 },
      ]},
    ],
  },
  {
    nsUS: 60, nsSI: 230,
    label: 'Ns 60 (US) / 230 (SI)',
    headRange: 'SI 214–334, US 48–75',
    gates: [
      { gatePercent: 20, points: [
        { head: 239.99, q: 38.65,  torque: 44.4   },
        { head: 220.18, q: 36.03,  torque: 38.97  },
        { head: 200.11, q: 33.34,  torque: 33.62  },
        { head: 180.12, q: 30.69,  torque: 28.28  },
        { head: 159.96, q: 27.98,  torque: 23.03  },
        { head: 139.98, q: 25.3,   torque: 17.64  },
        { head: 119.92, q: 22.66,  torque: 12.35  },
        { head: 100.1,  q: 20.04,  torque: 7.01   },
        { head: 90.0,   q: 19.0,   torque: 3.96   },
        { head: 79.94,  q: 17.97,  torque: 0.96   },
        { head: 69.93,  q: 14.99,  torque: -2.03  },
        { head: 59.99,  q: 12.04,  torque: -6.0   },
        { head: 50.06,  q: 10.01,  torque: -11.01 },
        { head: 39.96,  q: 5.99,   torque: -15.98 },
        { head: 30.04,  q: 1.98,   torque: -24.03 },
      ]},
      { gatePercent: 30, points: [
        { head: 240.1,  q: 62.67,  torque: 73.47  },
        { head: 220.04, q: 58.03,  torque: 66.01  },
        { head: 200.02, q: 53.31,  torque: 58.61  },
        { head: 179.87, q: 48.65,  torque: 51.26  },
        { head: 160.1,  q: 44.03,  torque: 44.03  },
        { head: 139.98, q: 39.34,  torque: 36.67  },
        { head: 120.0,  q: 34.68,  torque: 29.28  },
        { head: 100.06, q: 30.04,  torque: 22.01  },
        { head: 90.08,  q: 27.98,  torque: 17.02  },
        { head: 80.08,  q: 26.05,  torque: 12.01  },
        { head: 69.99,  q: 22.03,  torque: 7.0    },
        { head: 60.0,   q: 19.0,   torque: 0.0    },
        { head: 49.96,  q: 14.99,  torque: -6.99  },
        { head: 39.96,  q: 10.01,  torque: -13.99 },
        { head: 30.03,  q: 5.99,   torque: -22.01 },
      ]},
      { gatePercent: 40, points: [
        { head: 240.19, q: 79.36,  torque: 134.02 },
        { head: 219.8,  q: 73.96,  torque: 119.79 },
        { head: 200.08, q: 68.68,  torque: 106.04 },
        { head: 179.91, q: 63.37,  torque: 91.93  },
        { head: 159.98, q: 58.03,  torque: 77.91  },
        { head: 140.03, q: 52.67,  torque: 64.0   },
        { head: 119.94, q: 47.3,   torque: 50.01  },
        { head: 100.02, q: 42.02,  torque: 36.01  },
        { head: 90.03,  q: 38.99,  torque: 29.98  },
        { head: 80.1,   q: 36.03,  torque: 23.07  },
        { head: 69.95,  q: 30.04,  torque: 16.02  },
        { head: 60.08,  q: 22.03,  torque: 7.99   },
        { head: 49.45,  q: 18.9,   torque: -1.98  },
        { head: 39.94,  q: 14.99,  torque: -9.99  },
        { head: 30.0,   q: 10.01,  torque: -21.0  },
      ]},
      { gatePercent: 50, points: [
        { head: 239.91, q: 99.68,  torque: 158.34 },
        { head: 219.8,  q: 92.94,  torque: 142.87 },
        { head: 199.69, q: 86.27,  torque: 127.4  },
        { head: 179.91, q: 79.68,  torque: 112.26 },
        { head: 160.16, q: 73.03,  torque: 97.06  },
        { head: 140.02, q: 66.35,  torque: 81.63  },
        { head: 120.05, q: 59.64,  torque: 66.39  },
        { head: 100.14, q: 53.06,  torque: 51.07  },
        { head: 90.11,  q: 50.02,  torque: 42.08  },
        { head: 80.06,  q: 45.96,  torque: 34.02  },
        { head: 69.94,  q: 42.02,  torque: 23.99  },
        { head: 60.04,  q: 36.03,  torque: 13.99  },
        { head: 49.95,  q: 31.02,  torque: 4.0    },
        { head: 40.01,  q: 24.03,  torque: -8.0   },
        { head: 30.02,  q: 16.01,  torque: -20.02 },
      ]},
      { gatePercent: 60, points: [
        { head: 240.19, q: 107.99, torque: 215.45 },
        { head: 220.07, q: 102.1,  torque: 194.1  },
        { head: 199.85, q: 95.96,  torque: 172.47 },
        { head: 179.91, q: 90.0,   torque: 151.3  },
        { head: 160.19, q: 84.02,  torque: 130.07 },
        { head: 140.09, q: 78.06,  torque: 108.71 },
        { head: 119.96, q: 71.97,  torque: 87.33  },
        { head: 100.15, q: 66.06,  torque: 66.1   },
        { head: 89.91,  q: 61.97,  torque: 54.94  },
        { head: 79.96,  q: 56.96,  torque: 43.98  },
        { head: 69.96,  q: 52.04,  torque: 34.0   },
        { head: 59.93,  q: 44.99,  torque: 22.0   },
        { head: 50.03,  q: 38.99,  torque: 10.01  },
        { head: 39.95,  q: 32.01,  torque: -4.0   },
        { head: 30.05,  q: 24.03,  torque: -18.03 },
      ]},
      { gatePercent: 70, points: [
        { head: 239.96, q: 132.09, torque: 247.88 },
        { head: 219.77, q: 123.91, torque: 223.72 },
        { head: 200.04, q: 116.11, torque: 200.04 },
        { head: 180.17, q: 107.99, torque: 176.21 },
        { head: 159.97, q: 100.08, torque: 151.98 },
        { head: 140.09, q: 92.01,  torque: 128.04 },
        { head: 120.09, q: 84.02,  torque: 104.12 },
        { head: 99.95,  q: 75.99,  torque: 79.96  },
        { head: 90.0,   q: 71.97,  torque: 66.96  },
        { head: 80.04,  q: 67.07,  torque: 55.07  },
        { head: 69.97,  q: 61.97,  torque: 41.98  },
        { head: 60.05,  q: 54.99,  torque: 29.0   },
        { head: 49.94,  q: 48.03,  torque: 14.98  },
        { head: 39.98,  q: 40.03,  torque: 0.0    },
        { head: 30.04,  q: 32.01,  torque: -16.01 },
      ]},
      { gatePercent: 80, points: [
        { head: 239.47, q: 159.5,  torque: 279.7  },
        { head: 220.29, q: 149.03, torque: 253.34 },
        { head: 200.19, q: 138.31, torque: 225.82 },
        { head: 180.08, q: 127.79, torque: 198.45 },
        { head: 160.14, q: 117.05, torque: 171.19 },
        { head: 140.05, q: 106.27, torque: 143.7  },
        { head: 120.03, q: 95.58,  torque: 116.31 },
        { head: 100.07, q: 85.05,  torque: 89.06  },
        { head: 89.93,  q: 79.03,  torque: 74.91  },
        { head: 79.97,  q: 73.96,  torque: 61.02  },
        { head: 69.99,  q: 67.94,  torque: 48.02  },
        { head: 59.92,  q: 61.97,  torque: 33.98  },
        { head: 50.07,  q: 58.03,  torque: 20.03  },
        { head: 40.02,  q: 49.02,  torque: 6.0    },
        { head: 30.01,  q: 42.02,  torque: -9.99  },
      ]},
      { gatePercent: 90, points: [
        { head: 240.68, q: 179.2,  torque: 298.45 },
        { head: 219.66, q: 166.83, torque: 268.65 },
        { head: 200.14, q: 154.99, torque: 240.57 },
        { head: 180.2,  q: 143.08, torque: 211.91 },
        { head: 160.2,  q: 131.0,  torque: 183.27 },
        { head: 139.87, q: 118.97, torque: 154.14 },
        { head: 119.9,  q: 106.91, torque: 125.54 },
        { head: 100.01, q: 95.01,  torque: 97.01  },
        { head: 90.01,  q: 88.92,  torque: 82.0   },
        { head: 79.95,  q: 83.0,   torque: 67.95  },
        { head: 69.98,  q: 76.94,  torque: 53.95  },
        { head: 60.11,  q: 71.06,  torque: 40.09  },
        { head: 50.05,  q: 65.06,  torque: 25.02  },
        { head: 39.97,  q: 60.05,  torque: 13.99  },
        { head: 30.02,  q: 53.06,  torque: -3.99  },
      ]},
      { gatePercent: 100, points: [
        { head: 240.67, q: 188.84, torque: 315.52 },
        { head: 219.92, q: 175.88, torque: 283.92 },
        { head: 200.01, q: 163.47, torque: 253.41 },
        { head: 180.01, q: 150.65, torque: 222.68 },
        { head: 159.94, q: 138.02, torque: 191.92 },
        { head: 140.17, q: 125.45, torque: 161.48 },
        { head: 119.92, q: 112.65, torque: 130.59 },
        { head: 100.05, q: 100.08, torque: 100.05 },
        { head: 89.99,  q: 94.06,  torque: 86.03  },
        { head: 79.91,  q: 88.03,  torque: 69.92  },
        { head: 70.01,  q: 82.0,   torque: 56.0   },
        { head: 60.02,  q: 76.94,  torque: 43.03  },
        { head: 50.08,  q: 75.05,  torque: 32.05  },
        { head: 39.95,  q: 71.97,  torque: 19.97  },
        { head: 30.04,  q: 70.01,  torque: 6.01   },
      ]},
    ],
  },
];

export function getRecommendedNs(designHeadFt: number): { nsUS: number; reason: string } {
  if (designHeadFt <= 40) return { nsUS: 60, reason: 'Low-medium head → high specific speed recommended' };
  if (designHeadFt <= 70) return { nsUS: 45, reason: 'Medium head → mid specific speed recommended' };
  return { nsUS: 30, reason: 'Higher head → lower specific speed recommended' };
}

function linearInterp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (Math.abs(x1 - x0) < 1e-9) return y0;
  return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
}

function interpolateAtHead(points: TurbineCurvePoint[], targetHead: number): { q: number; torque: number } | null {
  const sorted = [...points].sort((a, b) => a.head - b.head);
  if (targetHead <= sorted[0].head) return { q: sorted[0].q, torque: sorted[0].torque };
  if (targetHead >= sorted[sorted.length - 1].head) {
    const last = sorted[sorted.length - 1];
    return { q: last.q, torque: last.torque };
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    if (targetHead >= sorted[i].head && targetHead <= sorted[i + 1].head) {
      return {
        q: linearInterp(targetHead, sorted[i].head, sorted[i + 1].head, sorted[i].q, sorted[i + 1].q),
        torque: linearInterp(targetHead, sorted[i].head, sorted[i + 1].head, sorted[i].torque, sorted[i + 1].torque),
      };
    }
  }
  return null;
}

export interface GenerateTcharOptions {
  nsGroup: TurbineNsGroup;
  selectedGatePercents: number[];
  designHead: number;
  designFlow: number;
  designEfficiency: number;
  numHeadSteps: number;
}

export interface GeneratedTchar {
  gate: number[];
  head: number[];
  qMatrix: number[][];
  effMatrix: number[][];
}

export function generateTcharFromCurves(opts: GenerateTcharOptions): GeneratedTchar {
  const { nsGroup, selectedGatePercents, designHead, designFlow, designEfficiency, numHeadSteps } = opts;

  const allNormHeads: number[] = [];
  nsGroup.gates.forEach(g => g.points.forEach(p => allNormHeads.push(p.head)));
  const minNormHead = Math.min(...allNormHeads);
  const maxNormHead = Math.max(...allNormHeads);

  const normHeadSteps: number[] = [];
  for (let i = 0; i < numHeadSteps; i++) {
    normHeadSteps.push(maxNormHead - (maxNormHead - minNormHead) * i / (numHeadSteps - 1));
  }

  const headScaleFactor = designHead / 100;
  const qScaleFactor = designFlow / 100;
  const effConst = designEfficiency * 100;

  const scaledHeads = normHeadSteps.map(h => parseFloat((h * headScaleFactor).toFixed(3)));

  const selectedGates = nsGroup.gates.filter(g => selectedGatePercents.includes(g.gatePercent));

  const qMatrix: number[][] = [];
  const effMatrix: number[][] = [];

  for (const gate of selectedGates) {
    const qRow: number[] = [];
    const effRow: number[] = [];
    for (const normH of normHeadSteps) {
      const interp = interpolateAtHead(gate.points, normH);
      if (!interp) {
        qRow.push(0);
        effRow.push(0);
        continue;
      }
      const scaledQ = parseFloat((interp.q * qScaleFactor).toFixed(3));
      const rawEff = (normH > 1 && interp.q > 1)
        ? (interp.torque / (normH * interp.q)) * effConst
        : 0;
      const clampedEff = parseFloat(Math.min(Math.max(rawEff, 0), 0.98).toFixed(4));
      qRow.push(scaledQ);
      effRow.push(clampedEff);
    }
    qMatrix.push(qRow);
    effMatrix.push(effRow);
  }

  return {
    gate: selectedGates.map(g => g.gatePercent),
    head: scaledHeads,
    qMatrix,
    effMatrix,
  };
}
