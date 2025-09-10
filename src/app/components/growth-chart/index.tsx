"use client";

import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./style.module.css";

export type GrowthPoint = {
    label: string;
    value: number | null;
};

type GrowthChartProps = {
    data: GrowthPoint[];
    height?: number;
    showLatestSummary?: boolean;
};

export const GrowthChart = ({ data, height = 180, showLatestSummary = true }: GrowthChartProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [width, setWidth] = useState<number>(420);

    // スケール計算用に null を除外した数値配列を作る
    const numericValues = useMemo(() => data.map(d => d.value).filter((v): v is number => typeof v === "number" && isFinite(v)), [data]);

    // ベースラインとして 0 を必ず含める（視認性のため）。
    // 注意: 最大値が大きく、最小値が 0 の場合に pad をそのまま適用すると
    // 大きな負の下限ができてしまい、例えば 200% が下に表示される原因になります。
    // そのため最小値が 0 の場合は pad を最大値に対する小さめの比率に抑えます。
    const yDomain = useMemo(() => {
        if (numericValues.length === 0) return [-100, 100];
        const minRaw = d3.min(numericValues) ?? 0;
        const maxRaw = d3.max(numericValues) ?? 0;
        let pad: number;
        if (minRaw === 0) {
            // 最小が 0 のときは max に対して小さめのパッドを使う
            pad = Math.max(10, maxRaw * 0.05);
        } else {
            pad = Math.max(10, (maxRaw - minRaw) * 0.1);
        }
        const min = Math.min(0, minRaw - pad);
        const max = Math.max(0, maxRaw + pad);
        return [min, max];
    }, [numericValues]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0].contentRect;
            setWidth(Math.max(280, Math.floor(cr.width)));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        if (!svg.node()) return;

        const margin = { top: 16, right: 12, bottom: 24, left: 36 };
        const innerW = Math.max(10, width - margin.left - margin.right);
        const innerH = Math.max(10, height - margin.top - margin.bottom);

        svg.attr("viewBox", `0 0 ${width} ${height}`);

        // 以前の描画をクリア
        svg.selectAll("g.root").remove();
        const g = svg.append("g").attr("class", "root").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3
            .scalePoint<string>()
            .domain(data.map((d) => d.label))
            .range([0, innerW])
            .padding(0.5);

        const y = d3.scaleLinear().domain(yDomain as [number, number]).nice().range([innerH, 0]);

        // グリッド線
        g.append("g")
            .attr("class", styles.grid)
            .selectAll("line.h")
            .data(y.ticks(5))
            .join("line")
            .attr("class", "h")
            .attr("x1", 0)
            .attr("x2", innerW)
            .attr("y1", (d: number) => y(d))
            .attr("y2", (d: number) => y(d));

        // 0% の基準線
        g.append("line")
            .attr("class", styles.baseline)
            .attr("x1", 0)
            .attr("x2", innerW)
            .attr("y1", y(0))
            .attr("y2", y(0));

        // null をギャップとして扱うラインジェネレータ
        const line = d3
            .line<GrowthPoint>()
            .defined((d: GrowthPoint) => typeof d.value === "number" && isFinite(d.value as number))
            .x((d: GrowthPoint) => x(d.label) ?? 0)
            .y((d: GrowthPoint) => y((d.value as number) ?? 0))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .attr("class", styles.line)
            .attr("fill", "none")
            .attr("d", line(data));

        // データ点（サークル）
        g.append("g")
            .attr("class", styles.points)
            .selectAll("circle")
            .data(data.filter((d: GrowthPoint) => typeof d.value === "number" && isFinite(d.value as number)))
            .join("circle")
            .attr("cx", (d: GrowthPoint) => x(d.label) ?? 0)
            .attr("cy", (d: GrowthPoint) => y(d.value as number))
            .attr("r", 2.5);

        // X 軸：目盛を間引いて表示（約4つに1つ）
        const tickCount = Math.max(2, Math.floor(data.length / 4));
        const xTicks = data.map((d) => d.label).filter((_, i) => i % Math.ceil(data.length / tickCount) === 0);
        const xAxisG = g.append("g")
            .attr("transform", `translate(0,${innerH})`)
            .call(d3.axisBottom(x).tickValues(xTicks).tickSize(0))
            .call((sel: d3.Selection<SVGGElement, unknown, null, undefined>) => sel.selectAll("path").attr("display", "none"))
            .call((sel: d3.Selection<SVGGElement, unknown, null, undefined>) => sel.selectAll("line").attr("display", "none"));

        // X 軸ラベルを短縮（M/D）して斜めにし、潰れを緩和
        xAxisG.selectAll<SVGTextElement, string>("text")
            .attr("class", styles.axisLabel)
            .text((d) => {
                try {
                    const dt = new Date(d as string);
                    if (!isNaN(dt.getTime())) return d3.timeFormat("%m/%d")(dt);
                } catch (e) {
                    // fallthrough
                }
                return String(d);
            })
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end")
            .attr("dx", "-0.35em")
            .attr("dy", "0.6em");

        // Y 軸（% 表示）
        const yAxis = g.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .call((sel: d3.Selection<SVGGElement, unknown, null, undefined>) => sel.selectAll("text").attr("class", styles.axisLabel))
            .call((sel: d3.Selection<SVGGElement, unknown, null, undefined>) => sel.selectAll("path").attr("display", "none"))
            .call((sel: d3.Selection<SVGGElement, unknown, null, undefined>) => sel.selectAll("line").attr("display", "none"));
        yAxis.selectAll<SVGTextElement, number>("text").text((d) => `${d}%`);
    }, [data, height, width, yDomain]);

    const last = data.at(-1)?.value;
    const latestText = useMemo(() => {
        if (typeof last !== "number" || !isFinite(last)) return "—";
        const sign = last > 0 ? "+" : "";
        return `${sign}${last.toFixed(1)}%`;
    }, [last]);

    // 利用可能な最新の週開始日を表示する（ユーザーがデータが最新か判断するため）
    const latestDataDate = useMemo(() => {
        for (let i = data.length - 1; i >= 0; i--) {
            const lbl = data[i]?.label;
            if (lbl) return lbl;
        }
        return null;
    }, [data]);

    const latestDataDateShort = useMemo(() => {
        if (!latestDataDate) return null;
        const dt = new Date(latestDataDate);
        if (isNaN(dt.getTime())) return latestDataDate;
        return d3.timeFormat("%Y-%m-%d")(dt);
    }, [latestDataDate]);

    return (
        <div className={styles.root} ref={containerRef}>
            {showLatestSummary && (
                <div className={styles.header}>
                    <span className={styles.title}>週次成長率</span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span className={styles.badge} aria-label="先週比">{latestText}</span>
                        {latestDataDateShort && <small style={{ color: "var(--muted, #6b7280)", marginTop: 2 }}>最新データ: {latestDataDateShort}</small>}
                    </span>
                </div>
            )}
            <svg ref={svgRef} className={styles.svg} role="img" aria-label="Weekly growth line chart" />
        </div>
    );
};

export default GrowthChart;
