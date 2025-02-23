import React, { useState } from "react";
import BaseInput from "../BaseInput";
import { EyeButton } from "./styled";
import { EyeClosedIcon } from "../../../../public/assets/icons/EyeClosed";
import { EyeOpenIcon } from "../../../../public/assets/icons/EyeOpen";

interface InputPasswordProps {
  id?: string;
  name: string;
  label?: string;
  width?: string;
  height?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputPassword = ({
  id,
  name,
  label,
  width,
  height,
  value,
  placeholder,
  onChange,
  ...rest
}: InputPasswordProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div style={{ position: "relative" }}>
      <BaseInput
        id={id}
        name={name}
        label={label}
        type={isPasswordVisible ? "text" : "password"}
        placeholder={placeholder}
        width={width}
        height={height}
        value={value}
        onChange={onChange}
        {...rest}
      />
      <EyeButton type="button" onClick={handleTogglePasswordVisibility}>
        {isPasswordVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
      </EyeButton>
    </div>
  );
};

export default InputPassword;
