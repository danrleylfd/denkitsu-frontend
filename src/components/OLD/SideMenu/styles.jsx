import styled, { css } from "styled-components"
import { Link } from "react-router-dom"

const Container = styled.div`
  display: flex;
`

const Sidebar = styled.aside`
  height: 100vh;
  background-color: ${({ theme }) => theme.cardBg};
  box-shadow: 0 0 10px rgba(95, 92, 92, 0.1);
  border-right: 1px solid ${({ theme }) => theme.border};
  transition: all 0.3s ease-in-out;
  z-index: 40;
  width: ${({ isOpen }) => (isOpen ? "12rem" : "3.5rem")};
`

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: .5rem;
`

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  padding: .25rem 1rem;
  color: ${({ theme }) => theme.color};
  background: none;
  border: none;
  cursor: pointer;
  margin: 0 .25rem;
  border-radius: .75rem;

  &:hover {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.primaryLight};
  }
  &:active {
    color: ${({ theme }) => theme.primaryDark};
  }
`

const IconWrapper = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Label = styled.span`
  user-select: none;
  margin-left: 0.75rem;
  transition: opacity 0.2s;
  /* ${({ isOpen }) =>
    isOpen
      ? css`
          opacity: 1;
        `
      : css`
          opacity: 0;
          width: 0;
          overflow: hidden;
        `} */
`

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: .25rem 1rem;
  color: ${({ theme }) => theme.color};
  text-decoration: none;
  margin: 0 .25rem;
  border-radius: .75rem;

  &:hover {
    background-color: ${({ theme }) => theme.background};
  }
`

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: .5rem;
  gap: .5rem;
  margin: 0 auto;
  height: 100vh;
  max-width: 67%;

  @media (max-width: 768px) {
    max-width: 75%;
  }
`

export { Container, Sidebar, Nav, ToggleButton, IconWrapper, Label, MenuItem, MainContent }
