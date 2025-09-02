"use client";

import { useState } from "react";
import { GithubGrass } from "../grass/index.";
import { Header } from "../header";
import { Input } from "../ui/input";

export const Home = () => {
    const [username, setUsername] = useState("");

    return (
        <main
            className="homeContainer"
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: 32,
                gap: 16,
            }}
        >
            <Header />
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            <div style={{ width: "min(820px, 95%)" }}>
                <GithubGrass username={username} />
            </div>
        </main>
    );
};
