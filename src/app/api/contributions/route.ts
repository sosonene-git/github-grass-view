import { NextResponse } from "next/server";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("username") ?? "";
    const username = raw.trim();

    // username 未指定でも 200 で空配列を返す（UI を静かに保つ）
    if (!username) {
        return NextResponse.json({ total: 0, contributions: [] });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return NextResponse.json(
            { error: "GITHUB_TOKEN is not set. Add it to .env.local" },
            { status: 500 }
        );
    }

    // 直近1年分を取得
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 370);

    const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

    const variables = {
        login: username,
        from: from.toISOString(),
        to: to.toISOString(),
    } as const;

    try {
        const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-GitHub-Api-Version": "2022-11-28",
            },
            body: JSON.stringify({ query, variables }),
            // サーバー側のみ
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: text }, { status: res.status });
        }

        const json = await res.json();

        // user が見つからない等のケースは 200 + 空データで返す
        const errors = json?.errors as Array<any> | undefined;
        const userNotFound = Array.isArray(errors)
            ? errors.some(
                (e) =>
                    e?.type === "NOT_FOUND" ||
                    e?.message?.includes?.("Could not resolve to a User") ||
                    (Array.isArray(e?.path) && e.path.includes("user"))
            )
            : false;

        const user = json?.data?.user;
        if (userNotFound || !user) {
            return NextResponse.json({ total: 0, contributions: [] });
        }

        const cal = user.contributionsCollection?.contributionCalendar;
        if (!cal) {
            return NextResponse.json({ total: 0, contributions: [] });
        }

        const contributions: { date: string; count: number; color?: string }[][] =
            (cal.weeks ?? []).map((w: any) =>
                (w.contributionDays ?? []).map((d: any) => ({
                    date: d.date,
                    count: d.contributionCount,
                    color: d.color,
                }))
            );

        return NextResponse.json({ total: cal.totalContributions ?? 0, contributions });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
    }
}
