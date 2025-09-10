"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGithubContributions } from "../../githubApi";
import styles from "./style.module.css";
import { WEEKDAYS } from "@/app/constans/date";
import { calcContributionColor } from "@/app/constans/colors";
import GrowthChart, { GrowthPoint } from "@/app/components/growth-chart";

type GithubGrassProps = {
    userName: string;
};

export const GithubGrass = (props: GithubGrassProps) => {
    const { userName } = props;

    // セルサイズとギャップ（CSS と同期）
    const CELL_SIZE = 12; // px
    const GAP = 3; // px

    const { data, isLoading, error } = useQuery({
        queryKey: ["github-contributions", userName],
        queryFn: () => fetchGithubContributions(userName),
        enabled: !!userName,
    });

    // メッセージは出すが、グリッド自体は常に表示する
    let statusMessage: string | null = null;
    if (!userName) statusMessage = "ユーザー名を入力してください";
    else if (isLoading) statusMessage = "読み込み中...";
    else if (error) statusMessage = "エラーが発生しました";

    // data があればそれを使い、なければダミーで 53 週 x 7 日の配列を作る
    const contributions = Array.isArray(data?.contributions)
        ? data.contributions
        : Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ date: "", count: 0 })));

    // 月ラベルを計算する（各週の最初の日を見て月が変わったところにラベルを置く）
    const monthLabels: { label: string; index: number }[] = [];
    let lastMonth: number | null = null;
    contributions.forEach((week: any, i: number) => {
        console.log("week", week)

        // 各週の最初の日を見て月が変わったところにラベルを置く
        const firstWithDate = week.find((d: any) => d?.date);

        // 最初の日付が見つからない場合はスキップ
        if (!firstWithDate) return;

        const dt = new Date(firstWithDate.date);

        // 日付が不正な場合はスキップ
        if (isNaN(dt.getTime())) return;

        // 月が変わったところにラベルを置く
        const m = dt.getMonth();

        // 最初の月は必ずラベルを置く
        if (m !== lastMonth) {
            monthLabels.push({ label: dt.toLocaleString("en-US", { month: "short" }), index: i });
            lastMonth = m;
        }
    });

    // 月境界（最初の月は除外）
    const monthBoundaryIndices = monthLabels.map(m => m.index).filter(i => i !== 0);

    // 週次合計と成長率を算出
    const weeklyTotals: { start: string; total: number }[] = contributions.map((week: any) => {
        const total = week.reduce((sum: number, d: any) => sum + (Number(d?.count ?? d?.contributionCount ?? 0) || 0), 0);
        const firstWithDate = week.find((d: any) => d?.date);
        // 週の最後の日付をラベルに使う（最新週のラベルが正しく最新日になるようにする）
        const lastWithDate = [...week].slice().reverse().find((d: any) => d?.date);
        // fallback: last -> first -> empty
        const start = lastWithDate?.date ?? firstWithDate?.date ?? "";
        return { start, total };
    });

    // 直近の52週だけに限定（多すぎると視認性低下）
    const trimmed = weeklyTotals.slice(-52);
    const growthSeries: GrowthPoint[] = trimmed.map((w, idx) => {
        if (idx === 0) return { label: w.start, value: null };
        const prev = trimmed[idx - 1];
        // 前週が0の場合、100%基準だと無限大になるため、差分ベースに切り替え: (curr - prev) * 100 if prev==0?
        // ここでは安全策として、prevが0なら 0/0 = 0% とする（実質的に比較不能のため）
        if (!prev || prev.total === 0) {
            const diff = w.total - (prev?.total ?? 0);
            return { label: w.start, value: diff === 0 ? 0 : (diff > 0 ? 100 : -100) };
        }
        const growth = ((w.total - prev.total) / prev.total) * 100;
        // 小数1桁に丸めは表示側でやるが、データは生で保持
        return { label: w.start, value: Number.isFinite(growth) ? growth : null };
    });

    // contributions: data.contributions (2次元配列)
    // GraphQL から来る色情報があれば優先して使い、なければ count に基づいて色を決める
    // day は { date, count } または GraphQL の contributionDays の shape を想定
    return (
        <div className={styles.root}>
            <h2 className={styles.title}>{data && <span>{userName} の contributions</span>}</h2>
            <div className={styles.gridWrapper}>
                <div className={styles.gridContainer}>
                    <div
                        className={styles.monthLabels}
                        style={{ gridTemplateColumns: `auto repeat(${contributions.length}, ${CELL_SIZE}px)` }}
                    >
                        <div />
                        {monthLabels.map((m) => (
                            <div key={m.index} className={styles.monthLabel} style={{ gridColumn: m.index + 2 }}>
                                {m.label}
                            </div>
                        ))}
                    </div>

                    <div className={styles.body}>
                        <div className={styles.weekdayLabels} style={{ gridTemplateRows: `repeat(7, 13px)` }}>
                            {WEEKDAYS.map((w, idx) => (
                                <div key={w} className={styles.weekdayLabel} style={{ gridRow: idx + 1 }}>
                                    {w}
                                </div>
                            ))}
                        </div>

                        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${contributions.length}, ${CELL_SIZE}px)`, gridTemplateRows: `repeat(7, ${CELL_SIZE}px)` }}>
                            {contributions.map((week: any, i: number) =>
                                week.map((day: any, j: number) => {
                                    const rawCount = day.count ?? day.contributionCount ?? 0;
                                    const count = Number(rawCount) || 0;
                                    const githubColor = day.color;

                                    // 背景色は共通関数で算出
                                    const background = calcContributionColor(count, githubColor);

                                    return (
                                        <div
                                            key={`${i}-${j}`}
                                            title={day.date ? `${day.date}: ${count} contributions` : undefined}
                                            className={styles.cell}
                                            style={{
                                                background,
                                                gridColumn: i + 1,
                                                gridRow: j + 1,
                                            }}
                                        />
                                    );
                                })
                            )}
                        </div>

                        {/* 月境界ライン */}
                        <div className={styles.monthBoundaries} style={{ height: (CELL_SIZE * 7) + (GAP * 6) }}>
                            {monthBoundaryIndices.map(idx => (
                                <div
                                    key={idx}
                                    className={styles.monthBoundary}
                                    style={{ left: idx * (CELL_SIZE + GAP) }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 週次成長率の折れ線グラフ */}
            {data && (
                <div style={{ marginTop: 16, width: "100%", display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "min(100%, 720px)" }}>
                        <GrowthChart data={growthSeries} />
                    </div>
                </div>
            )}
        </div>
    );
}
