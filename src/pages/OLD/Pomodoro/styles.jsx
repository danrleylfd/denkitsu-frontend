import styled from "styled-components"

export const SideContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: .5rem;
  gap: .5rem;
  margin: 0 auto;
  height: 100vh;
  background-color: #7159C1;
`

export const PomodoroCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 1rem;
  border-radius: .5rem;
  width: 100%;
  max-width: 28rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
`

export const PomoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
`

export const TimerIcon = styled.div`
  width: 2rem;
  height: 2rem;
  color: ${({ theme }) => theme.color};
  margin-right: 0.5rem;
`

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`

export const Title = styled.h1`
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color};

`

export const Subtitle = styled.h2`
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color};
`

export const DisplaySection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

export const TimeText = styled.div`
  font-size: 3.75rem;
  line-height: 1;
  font-weight: 700;
  color: ${({ theme }) => theme.color};
  margin-bottom: 1rem;
`

export const ModeText = styled.div`
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color};
  margin-bottom: 0.5rem;
`

export const CyclesText = styled.div`
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.color};
`

export const Controls = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;

  & > * + * {
    margin-left: 1rem;
  }
`

export const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
`

export const ControlButtonIcon = styled.div`
  width: 1.5rem;
  height: 1.5rem;
`

export const SettingsInfo = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 0.5rem;
  padding: 1rem;
`

export const SettingsTextContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.color};
`

export const SettingsIcon = styled.div`
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
`
