export async function fetchGithubContributions(username: string) {
    const res = await fetch(`/api/contributions?username=${encodeURIComponent(username)}`, {
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json();
}
