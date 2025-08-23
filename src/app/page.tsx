"use client";

import { useState } from "react";
import GithubGrass from "./components/grass/index.";
import Header from "./components/header";
import Input from "./components/ui/input";

export default function Home() {
  const [username, setUsername] = useState("");
  return (
    <main
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
      <Input
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <div style={{ width: "min(820px, 95%)" }}>
        <GithubGrass username={username} />
      </div>
    </main>
  );
}
