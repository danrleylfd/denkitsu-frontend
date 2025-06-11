import styled from "styled-components"

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding-right: .25rem;

  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 2rem;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.color};
  font-size: 1rem;
`

const StyledInput = styled.input`
  width: 100%;
  padding: .5rem .25rem;

  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 1rem;
  color: ${({ theme }) => theme.color};
  font-size: 1rem;
`

export { InputContainer, StyledInput }
