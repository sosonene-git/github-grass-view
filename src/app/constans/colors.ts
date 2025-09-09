// コントリビュートの色
export const CONTRIBUTION_COLORS = {
    empty: "#dfe1e4",
    level1: "#9be9a8",
    level2: "#40c463",
    level3: "#216e39",
} as const;


export const calcContributionColor = (count: number, githubColor?: string): string => {
    if (count === 0) return CONTRIBUTION_COLORS.empty;

    // GraphQL 等から color が来ていればそれを優先
    if (githubColor) return githubColor;
    if (count <= 1) return CONTRIBUTION_COLORS.level1;
    if (count <= 3) return CONTRIBUTION_COLORS.level2;
    return CONTRIBUTION_COLORS.level3;
};
