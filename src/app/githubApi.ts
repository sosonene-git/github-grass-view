export async function fetchGithubContributions(username: string) {
    const u = (username ?? "").trim();
    if (!u) return { total: 0, contributions: [] };
    // API ルート側は userName (N 大文字) を期待しているためキーを合わせる
    // サーバー側を柔軟にする代わりにフロントで統一
    const res = await fetch(`/api/contributions?userName=${encodeURIComponent(u)}`, {
        cache: "no-store",
    });
    if (!res.ok) {
        // Surface server error code; component handles error state while still showing placeholder grid
        const text = await res.text().catch(() => "");
        throw new Error(`API /api/contributions failed: ${res.status} ${text}`);
    }
    return res.json();
}
