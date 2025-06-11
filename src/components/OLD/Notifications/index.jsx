import styled from "styled-components"

const MessageBase = styled.p`
  color: ${({ theme }) => theme.color};
  text-align: center;
  padding: .5rem 0;
`

const MessageSuccess = styled(MessageBase)`
  color: ${({ theme }) => theme.successBase};
`

const MessageWarning = styled(MessageBase)`
  color: ${({ theme }) => theme.warningBase};
`

const MessageError = styled(MessageBase)`
  color: ${({ theme }) => theme.dangerBase};
`

export { MessageBase, MessageSuccess, MessageWarning, MessageError }
