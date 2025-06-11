import styled, { keyframes } from "styled-components"

const spin = keyframes`
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
`

export const Spinner = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;

  border: 2px solid transparent;
  border-top-color: currentColor;
  animation: ${spin} 0.6s linear infinite;
`

export const BtnContainer = styled.div`
  display: flex;
  justify-content: center;
`

export const Btn = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  opacity: ${({ $loading }) => $loading ? 0.7 : 1};
  pointer-events: ${({ $loading }) => $loading ? "none" : "auto"};
  border-radius: ${({ $rounded, $squared }) => $rounded ? "99999px" : $squared ? 0 : ".25rem" };

  font-weight: 700;
  text-transform: uppercase;

  cursor: pointer;
  user-select: none;
  transition: background-color .3s ease 0s, box-shadow .3s ease 0s;

  &:disabled {
    cursor: not-allowed;
    opacity: 50%;
  }

  &.primary {
    background-color: ${({ theme }) => theme.primaryBase};
    color: ${({theme}) => theme.btnFgBase};

    &:hover {
      background-color: ${({ theme }) => theme.primaryLight};
    }

    &:active {
      background-color: ${({ theme }) => theme.primaryDark};
    }
  }

  &.outline {
    background-color: ${({ theme }) => theme.btnBgBase};
    color: ${({theme}) => theme.primaryBase};

    &:hover {
      background-color: ${({ theme }) => theme.btnBgLight};
      color: ${({theme}) => theme.primaryLight};
    }

    &:active {
      background-color: ${({ theme }) => theme.btnBgDark};
      color: ${({theme}) => theme.primaryDark};
    }
  }

  &.secondary {
    background-color: ${({ theme }) => theme.btnBgBase};
    color: ${({theme}) => theme.btnFgAlt};

    &:hover {
      background-color: ${({ theme }) => theme.btnBgLight};
    }

    &:active {
      background-color: ${({ theme }) => theme.btnBgDark};
    }
  }

  &.tertiary {
    background-color: ${({ theme }) => theme.btnBgLight};
    color: ${({theme}) => theme.btnFgAlt};

    &:hover {
      background-color: ${({ theme }) => theme.btnBgBase};
    }

    &:active {
      background-color: ${({ theme }) => theme.btnBgDark};
    }
  }

  &.success {
    background-color: ${({ theme }) => theme.btnBgBase};
    color: ${({theme}) => theme.successBase};

    &:hover {
      background-color: ${({ theme }) => theme.btnBgDark};
      color: ${({theme}) => theme.successLight};
    }

    &:active {
      background-color: ${({theme}) => theme.successLight};
      color: ${({ theme }) => theme.btnBgBase};
    }
  }

  &.warning {
    background-color: ${({ theme }) => theme.btnBgBase};
    color: ${({theme}) => theme.warningBase};

    &:hover {
      background-color: ${({ theme }) => theme.btnBgDark};
      color: ${({theme}) => theme.warningLight};
    }

    &:active {
      background-color: ${({theme}) => theme.warningLight};
      color: ${({ theme }) => theme.btnBgBase};
    }
  }

  &.danger {
    background-color: ${({ theme }) => theme.btnBgBase};
    color: ${({theme}) => theme.dangerBase};

    &:hover {
      background-color: ${({ theme }) => theme.btnBgDark};
      color: ${({theme}) => theme.dangerLight};
    }

    &:active {
      background-color: ${({theme}) => theme.dangerLight};
      color: ${({ theme }) => theme.btnBgBase};
    }
  }

  &.icon {
    height: 2rem;
    padding: 0 .5rem;
    font-size: .5rem;
  }

  &.sm {
    height: 2rem;
    padding: 0 1rem;
    font-size: .75rem;
  }

  &.md {
    height: 2.25rem;
    padding: 0 1.5rem;
  }

  &.lg {
    height: 2.5rem;
    padding: 0 2rem;
  }
`
