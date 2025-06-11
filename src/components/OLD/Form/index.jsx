import { FormCard, FormStyled } from "./styles"

const Form = ({ title, children }) => {
  return (
    <FormCard>
      <h2 style={{ paddingBottom: "1rem" }}>{title}</h2>
      <FormStyled onSubmit={(e) => e.preventDefault()}>{children}</FormStyled>
    </FormCard>
  )
}

export default Form
