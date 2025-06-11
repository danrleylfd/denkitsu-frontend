import { InputContainer, StyledInput } from "./styles"

const Input = ({ type = "text", placeholder, value, onChange, containerStyle, style, children, ...props }) => {
  return (
    <InputContainer style={containerStyle}>
      <StyledInput
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={style}
        {...props}
      />
      {children}
    </InputContainer>
  )
}

export default Input
