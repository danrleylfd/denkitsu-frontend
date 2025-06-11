import styled from "styled-components";

const FormStyled = styled.form`
  background-color: ${({ theme }) => theme.cardBg};
  display: flex;
  padding: 1rem;
  border-radius: .5rem;
  gap: .5rem;
`

export { FormStyled }
