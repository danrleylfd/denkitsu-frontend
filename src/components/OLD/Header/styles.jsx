import styled from "styled-components"
import { Link } from "react-router-dom"

const HeaderStyled = styled.header`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: .5rem;
  gap: .5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  nav {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  @media (max-width: 1075px) {
    flex-direction: row;
    align-items: flex-start;

    nav {
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
  }
`

const HeaderLink = styled(Link)`
  display: unset;
`

const HeaderTitle = styled.h5`
  user-select: none;
`

export { HeaderStyled, HeaderTitle, HeaderLink }
