import styles from "./style.module.css";
import React from "react";

type InputProps = {
    placeholder?: string;
    value: string;
    icon?: React.ReactNode;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    iconOnClick?: () => void;
}

export const Input = (props: InputProps) => {
    const { placeholder, value, onChange, icon, iconOnClick } = props;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [showTooltip, setShowTooltip] = React.useState(false);

    /** ツールチップを表示・非表示する関数 */
    const show = () => setShowTooltip(true);
    const hide = () => setShowTooltip(false);

    /** アイコンがクリックされたときの処理 */
    const handleIconActivate = (e?: React.SyntheticEvent) => {
        if (iconOnClick) iconOnClick();
        inputRef.current?.focus();
        e?.preventDefault?.();
    };

    /** アイコンがキーダウンされたときの処理 */
    const handleIconKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!iconOnClick) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleIconActivate();
        }
    };

    return (
        <div className={styles.inputWrapper}>
            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={icon ? `${styles.input} ${styles.withIcon}` : styles.input}
            />
            {icon && (
                <div
                    className={styles.icon}
                    onClick={iconOnClick ? handleIconActivate : undefined}
                    onKeyDown={iconOnClick ? handleIconKeyDown : undefined}
                    onMouseEnter={show}
                    onMouseLeave={hide}
                    onFocus={show}
                    onBlur={hide}
                    role={iconOnClick ? "button" : undefined}
                    tabIndex={iconOnClick ? 0 : undefined}
                >
                    {icon}
                    {iconOnClick && (
                        <div
                            className={styles.tooltip}
                            style={{ opacity: showTooltip ? 1 : 0, pointerEvents: showTooltip ? "auto" : "none" }}
                            aria-hidden={!showTooltip}
                        >
                            私の草を見る
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

