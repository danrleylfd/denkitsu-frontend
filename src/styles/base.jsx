import { createGlobalStyle } from "styled-components"
import { useTheme } from "../contexts/ThemeContext"

export default createGlobalStyle`
  /* *, *::before, *::after {
    margin: 0;
    padding: 0;
    outline: 0;
    border: 0;
    box-sizing: border-box;
    font-family: "Roboto", sans-serif;
  } */

  body {
    /* -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale; */
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.color};
  }

  /* h1 {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
  }

  h2 {
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.25;
  }

  h3 {
    font-size: 1.75rem;
    font-weight: 500;
    line-height: 1.3;
  }

  h4 {
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 1.35;
  }

  h5 {
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.4;
  }

  h6 {
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.45;
  } */

  a {
    color: ${({ theme }) => theme.primaryBase};
    /* font-size: .875rem;
    font-weight: 500;
    text-decoration: none; */

    &:hover {
      color: ${({ theme }) => theme.primaryLight};
      /* text-decoration: none; */
    }

    &:active {
      color: ${({ theme }) => theme.primaryDark};
    }
  }

  /* p, span, label, mark, ol, ul, li {
    font-size: .875rem;
    font-weight: 400;
    line-height: 1.6;
  }

  ol, ul, li {
    list-style-position: inside;
  }

  strong {
    font-size: .875rem;
    font-weight: 700;
    line-height: 1.6;
  }

  em {
    font-size: .875rem;
    font-style: italic;
    line-height: 1.6;
  } */

  small, caption, sup, sub {
    color: ${({ theme }) => theme.textSecondary};
    /* font-size: .75rem;
    font-weight: 400;
    line-height: 1.43; */
  }
`
