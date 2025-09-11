// contributions (週ごとの配列) から月ラベルを計算する純粋関数
export function calcMonthLabels(contributions: any[]): { label: string; index: number }[] {
    const monthLabels: { label: string; index: number }[] = [];
    let lastMonth: number | null = null;

    contributions.forEach((week: any, i: number) => {
        // 各週の最初の日を見て月が変わったところにラベルを置く
        const firstWithDate = week.find((d: any) => d?.date);
        if (!firstWithDate) return;

        const dt = new Date(firstWithDate.date);
        if (isNaN(dt.getTime())) return;

        const m = dt.getMonth();
        if (m !== lastMonth) {
            monthLabels.push({ label: dt.toLocaleString("en-US", { month: "short" }), index: i });
            lastMonth = m;
        }
    });

    return monthLabels;
}

export default calcMonthLabels;
