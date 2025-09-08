"use client";

import { useState } from "react";
import { GithubGrass } from "../grass/index.";
import { Header } from "../header";
import { Input } from "../ui/input";
import { Icon } from "../ui/icon";
import styles from "./style.module.css";

export const Home = () => {
    const [userName, setUserName] = useState("");

    /** 自分のユーザー名をすぐ入れられるようにする。現状固定。 */
    const fillMine = () => setUserName("sosonene-git");

    return (
        <main className={styles.homeContainer}>
            <Header />
            <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                icon={<Icon name="user" size={24} />}
                iconOnClick={fillMine}
            />
            <div className={styles.grassContainer}>
                <GithubGrass userName={userName} />
            </div>
        </main>
    );
};
