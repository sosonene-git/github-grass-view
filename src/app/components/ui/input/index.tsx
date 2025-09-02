import styles from "./style.module.css";

type InputProps = {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = (props: InputProps) => {
    const { placeholder, value, onChange } = props;

    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={styles.input}
        />
    );
};

