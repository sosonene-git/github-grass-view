"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGithubContributions } from "../../githubApi";
import styles from "./style.module.css";

export default function GithubGrass({ username }: { username: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["github-contributions", username],
        queryFn: () => fetchGithubContributions(username),
        enabled: !!username,
    });

    // メッセージは出すが、グリッド自体は常に表示する
    let statusMessage: string | null = null;
    if (!username) statusMessage = "ユーザー名を入力してください";
    else if (isLoading) statusMessage = "読み込み中...";
    else if (error) statusMessage = "エラーが発生しました";

    // data があればそれを使い、なければダミーで 53 週 x 7 日の配列を作る
    const contributions = Array.isArray(data?.contributions)
        ? data.contributions
        : Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ date: "", count: 0 })));

    // contributions: data.contributions (2次元配列)
    // GraphQL から来る色情報があれば優先して使い、なければ count に基づいて色を決める
    // day は { date, count } または GraphQL の contributionDays の shape を想定
    return (
        <div className={styles.root}>
            <h2 className={styles.title}>{data && <span>{username} の contributions</span>}</h2>
            <div className={styles.gridWrapper}>
                <div className={styles.grid} style={{ gridTemplateColumns: `repeat(53, 8px)` }}>
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
            </div>
        </div>
    );
}
