"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGithubContributions } from "../../githubApi";
import styles from "./style.module.css";
import { WEEKDAYS } from "@/app/constans/date";

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
                                    // day may have different shapes: { date, count } or { date, contributionCount, color }
                                    const rawCount = day.count ?? day.contributionCount ?? 0;
                                    const count = Number(rawCount) || 0;
                                    const githubColor = day.color;

                                    // カウントがゼロのマスは常に薄いグレーにする（GitHub color が来ていても上書き）
                                    let background: string;
                                    if (count === 0) {
                                        background = "#dfe1e4";
                                    } else if (githubColor) {
                                        background = githubColor;
                                    } else if (count <= 1) {
                                        background = "#9be9a8";
                                    } else if (count <= 3) {
                                        background = "#40c463";
                                    } else {
                                        background = "#216e39";
                                    }

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
        </div>
    );
}
