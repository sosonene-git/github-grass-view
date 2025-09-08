export async function fetchGithubContributions(username: string) {
    const u = (username ?? "").trim();
    if (!u) return { total: 0, contributions: [] };
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
