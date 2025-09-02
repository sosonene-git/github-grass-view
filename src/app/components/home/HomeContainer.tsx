"use client";

import { useState } from "react";
import { GithubGrass } from "../grass/index.";
import { Header } from "../header";
import { Input } from "../ui/input";
import styles from "./style.module.css";

export const Home = () => {
    const [username, setUsername] = useState("");

    return (
        <main className={styles.homeContainer}>
            <Header />
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            <div className={styles.grassContainer}>
                <GithubGrass username={username} />
            </div>
        </main>
    );
};
