import styled from "styled-components"

export const SideContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: .5rem;
  margin: 0 auto;
  height: 100vh;
`

export const ChatBody = styled.div`
  background-color: ${({ theme }) => theme.background};
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: .5rem 0;
  gap: .5rem;
  overflow-y: auto;
`

export const MessageRow = styled.div`
  display: ${({ $msgOwner }) => $msgOwner === "system" ? "none" : "flex"};
  justify-content: ${({ $msgOwner }) => $msgOwner === "assistant" ? "flex-start" : $msgOwner === "system" ? "center" : "flex-end"};
  padding: 0 .5rem;
  display: "flex";
  gap: .5rem;
  align-items: flex-end;
`

export const Imagem = styled.img`
  width: 100%;
  height: 100%;
  max-width: 2rem;
  max-height: 2rem;
  border-radius: 50%;
`

export const MessageBubble = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.color};
  padding: .5rem 1rem;
  border-radius: .5rem;
  max-width: 60%;
  box-shadow: 0 2px .5rem rgba(0,0,0,0.08);
  word-break: break-word;
`

export const CustomPre = styled.pre`
  font-family: "JetBrains Mono", "Courier New", Courier, monospace;
  font-size: .75rem;
  padding: .5rem;
  border-radius: .5rem;
`

export const CustomCode = styled.code`
  font-family: "JetBrains Mono", "Courier New", Courier, monospace;
  font-size: .75rem;
  padding: .5rem;
  border-radius: .5rem;
`

export const InputArea = styled.div`
  background-color: ${({ theme }) => theme.background};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .5rem;
  gap: .5rem;
`

export const Dropdown = styled.select`
  background-color: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.color};
  font-size: 0.875rem;
  min-height: 48px;
  max-width: 10rem;
  padding: .5rem;
  border-radius: .5rem;
`

export const StyledTextarea = styled.textarea`
  background-color: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.color};
  flex: 1;
  resize: vertical;
  min-height: 44px;
  max-height: 120px;
  max-width: --webkit-fill-available;
  padding: 1rem .5rem;
  border-radius: .5rem;
  font-family: "JetBrains Mono", "Courier New", Courier, monospace;
  font-size: .875rem;
  overflow-y: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`
