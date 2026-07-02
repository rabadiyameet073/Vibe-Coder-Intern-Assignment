// ─── FollowerChart ──────────────────────────────────────────────────────────
// Interactive SVG area chart for follower growth over time.
// Refactored: uses strong types, centralized formatMonth utility,
// moved from components/ to feature folder.

import { useState, useRef, useCallback, useMemo, memo } from "react";
import type { StatHistoryEntry } from "@/types";
import { formatFollowers, formatMonth } from "@/utils/formatters";

interface FollowerChartProps {
  data: readonly StatHistoryEntry[];
}

// SVG layout constants — defined at module level to avoid recreation
const SVG_WIDTH = 600;
const SVG_HEIGHT = 250;
const PADDING = { top: 20, right: 20, bottom: 40, left: 55 } as const;
const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;
const GRID_LINE_COUNT = 4;
const PADDING_COEFFICIENT = 0.1;

export const FollowerChart = memo(function FollowerChart({
  data,
}: FollowerChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute chart geometry from data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const followerValues = data.map((d) => d.followers);
    const minVal = Math.min(...followerValues);
    const maxVal = Math.max(...followerValues);
    const valRange = maxVal - minVal;
    const minScaled = Math.max(0, minVal - valRange * PADDING_COEFFICIENT);
    const maxScaled = maxVal + valRange * PADDING_COEFFICIENT;
    const rangeScaled = maxScaled - minScaled || 1;

    const points = data.map((d, i) => ({
      x: PADDING.left + (i / Math.max(data.length - 1, 1)) * CHART_WIDTH,
      y:
        SVG_HEIGHT -
        PADDING.bottom -
        ((d.followers - minScaled) / rangeScaled) * CHART_HEIGHT,
      month: d.month,
      followers: d.followers,
    }));

    const linePath =
      `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${
      SVG_HEIGHT - PADDING.bottom
    } L ${points[0].x} ${SVG_HEIGHT - PADDING.bottom} Z`;

    const gridLines = Array.from({ length: GRID_LINE_COUNT }).map((_, i) => {
      const yRatio = i / (GRID_LINE_COUNT - 1);
      return {
        y: PADDING.top + yRatio * CHART_HEIGHT,
        val: maxScaled - yRatio * rangeScaled,
      };
    });

    return { points, linePath, areaPath, gridLines };
  }, [data]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!containerRef.current || !chartData) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX =
        ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;

      let closestIndex = 0;
      let minDiff = Infinity;

      chartData.points.forEach((p, idx) => {
        const diff = Math.abs(p.x - mouseX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = idx;
        }
      });

      setHoveredIndex(closestIndex);
    },
    [chartData]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  if (!chartData) {
    return (
      <div
        className="h-48 flex items-center justify-center text-txt-muted text-sm"
        role="status"
      >
        No historical data available.
      </div>
    );
  }

  const { points, linePath, areaPath, gridLines } = chartData;

  // Determine which x-axis labels to show to avoid crowding
  const shouldShowLabel = (idx: number) =>
    idx === 0 ||
    idx === points.length - 1 ||
    (points.length > 5 && idx === Math.floor(points.length / 2)) ||
    (points.length > 8 &&
      (idx === Math.floor(points.length / 4) ||
        idx === Math.floor(points.length * 0.75)));

  return (
    <div
      className="relative w-full bg-card border-1.5 border-border-custom p-5 rounded-lg shadow-hard-sm"
      ref={containerRef}
    >
      <div className="flex justify-between items-center mb-6 text-left">
        <div>
          <h3 className="text-lg font-serif font-normal text-txt-primary">
            Follower Growth
          </h3>
          <p className="text-xs text-txt-muted">
            Monthly follower trend analysis
          </p>
        </div>
        {hoveredIndex !== null && (
          <div className="text-right text-xs font-mono font-semibold uppercase tracking-wider" aria-live="polite">
            <span className="text-txt-muted mr-1.5">Selected:</span>
            <span className="text-brand-primary">
              {formatMonth(data[hoveredIndex].month)}
            </span>
            <span className="text-txt-muted mx-1.5" aria-hidden="true">
              •
            </span>
            <span className="text-txt-primary">
              {formatFollowers(data[hoveredIndex].followers)}
            </span>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto min-w-[500px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label="Follower growth chart"
        >
          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="opacity-60">
              <line
                x1={PADDING.left}
                y1={line.y}
                x2={SVG_WIDTH - PADDING.right}
                y2={line.y}
                stroke="var(--border-color)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={PADDING.left - 8}
                y={line.y + 4}
                textAnchor="end"
                fill="var(--text-muted)"
                className="text-[10px] font-mono"
              >
                {formatFollowers(line.val)}
              </text>
            </g>
          ))}

          {/* Area under line - solid theme-aware accent overlay, NO gradients */}
          <path d={areaPath} fill="var(--color-primary-light)" />

          {/* Line path */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-axis labels */}
          {points.map(
            (p, idx) =>
              shouldShowLabel(idx) && (
                <text
                  key={`label-${idx}`}
                  x={p.x}
                  y={SVG_HEIGHT - PADDING.bottom + 18}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  className="text-[10px]"
                >
                  {formatMonth(p.month)}
                </text>
              )
          )}

          {/* Data points */}
          {points.map((p, idx) => (
            <circle
              key={`point-${idx}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === idx ? 6 : 3}
              className={
                hoveredIndex === idx
                  ? "fill-brand-primary stroke-card"
                  : "fill-brand-primary"
              }
              style={{ strokeWidth: hoveredIndex === idx ? 2 : 0, transition: "r 150ms ease" }}
            />
          ))}

          {/* Hover vertical indicator */}
          {hoveredIndex !== null && (
            <line
              x1={points[hoveredIndex].x}
              y1={PADDING.top}
              x2={points[hoveredIndex].x}
              y2={SVG_HEIGHT - PADDING.bottom}
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              className="pointer-events-none opacity-30"
              strokeDasharray="2 2"
            />
          )}
        </svg>
      </div>
    </div>
  );
});
