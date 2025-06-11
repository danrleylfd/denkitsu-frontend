import styled from "styled-components"

export const PaperContainer = styled.div`
  padding: 1rem;
  border-radius: .5rem;
  width: 100%;
  background-color: ${({theme}) => theme.cardBg};
  border: 1px solid ${({theme}) => theme.border};
`
