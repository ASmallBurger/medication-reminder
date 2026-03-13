import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface PieChartProps {
  taken: number;
  missed: number;
  size?: number;
}

/**
 * Lightweight two-slice pie chart using react-native-svg.
 * Shows taken (green) vs missed (red) with percentage labels.
 */
export default function PieChart({ taken, missed, size = 180 }: PieChartProps) {
  const total = taken + missed;
  const radius = size / 2;
  const center = radius;

  if (total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius - 2} fill="#E5E5EA" />
        </Svg>
        <View style={[styles.centerLabel, { width: size, height: size }]}>
          <Text style={styles.noDataText}>No Data</Text>
        </View>
      </View>
    );
  }

  const takenPct = Math.round((taken / total) * 100);
  const missedPct = 100 - takenPct;

  // Calculate the arc path for the "taken" slice
  const takenAngle = (taken / total) * 360;
  const takenPath = describeArc(center, center, radius - 2, 0, takenAngle);
  const missedPath = describeArc(center, center, radius - 2, takenAngle, 360);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Taken slice (green) */}
          {taken > 0 && (
            <Path d={takenPath} fill="#34C759" />
          )}
          {/* Missed slice (red) */}
          {missed > 0 && (
            <Path d={missedPath} fill="#FF3B30" />
          )}
          {/* Center white circle for donut effect */}
          <Circle cx={center} cy={center} r={radius * 0.55} fill="#fff" />
        </Svg>
        <View style={[styles.centerLabel, { width: size, height: size }]}>
          <Text style={styles.centerTotal}>{total}</Text>
          <Text style={styles.centerSubtext}>Total</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.legendText}>Taken {takenPct}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>Missed {missedPct}%</Text>
        </View>
      </View>
    </View>
  );
}

// ─── SVG Arc Helper ─────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  // Full circle edge case
  if (endAngle - startAngle >= 360) {
    const half = startAngle + 180;
    return describeArc(cx, cy, r, startAngle, half) + ' ' + describeArc(cx, cy, r, half, endAngle);
  }

  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  container: {
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTotal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  centerSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: -2,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
});
