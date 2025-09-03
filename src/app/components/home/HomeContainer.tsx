"use client";

import { useState } from "react";
import { GithubGrass } from "../grass/index.";
import { Header } from "../header";
import { Input } from "../ui/input";
import styles from "./style.module.css";

export const Home = () => {
    const [userName, setUserName] = useState("");

    return (
        <main className={styles.homeContainer}>
            <Header />
            <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
            <div className={styles.grassContainer}>
                <GithubGrass userName={userName} />
            </div>
        </main>
    );
};
