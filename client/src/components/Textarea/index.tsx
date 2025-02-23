import { TextareaHTMLAttributes } from "react";
import { TextareaWrapper, Label, StyledTextarea } from "./styled";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  name: string;
  label?: string;
  width?: string;
  height?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Textarea = ({
  id,
  name,
  label,
  placeholder,
  width,
  height,
  value,
  onChange,
}: TextareaProps) => {
  return (
    <TextareaWrapper width={width}>
      {label && <Label htmlFor={id || name}>{label}</Label>}
      <StyledTextarea
        id={id}
        name={name}
        placeholder={placeholder}
        width={width}
        height={height}
        value={value}
        onChange={onChange}
      />
    </TextareaWrapper>
  );
};

export default Textarea;
