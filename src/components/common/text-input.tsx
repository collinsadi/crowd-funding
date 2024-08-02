import { type ChangeEventHandler } from "react";

interface Props {
    label: string;
    placeholder: string;
    value?: string | number;
    type?: string;
    id: string;
    name: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
}

const TextInput = (props: Props) => {
    const { label, placeholder, value, type, id, name, onChange } = props;

    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="font-semibold text-sm text-[#1F1F1F] ">{label}</label>
            <input
                placeholder={placeholder}
                value={value}
                type={type ? type : "text"}
                id={id}
                name={name}
                className=""
                onChange={onChange}
            />
        </div>
    )
}

export default TextInput