import styled from "styled-components"

const CommentStyled = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  display: flex;
  flex-direction: column;
  padding: .5rem 1rem;
  border-radius: .5rem;
  gap: .5rem;
`

const Avatar = styled.img`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
`

export { CommentStyled, Avatar }
