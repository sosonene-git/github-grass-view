import styles from "./style.module.css";

type InputProps = {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({ placeholder, value, onChange }: InputProps) => {
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

export default Input;
