import styled from "styled-components"

const FormCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 3rem 1rem;
  border-radius: .5rem;
  width: 100%;
  max-width: 350px;
  text-align: center;
`

const FormStyled = styled.form`
  display: flex;
  flex-direction: column;
  gap: .5rem;
`

export { FormCard, FormStyled }
