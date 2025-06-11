// import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"
import Input from "../../Input"
import Button from "../../Button"
import { LuThumbsUp, LuMessageCircle, LuShare2 } from "react-icons/lu"

const Card = styled.div`
  width: 100%;
  height: fit-content;
  max-width: 20rem;
  border-radius: .5rem;
  overflow: hidden;
  border: 1px solid ${({theme}) => theme.btnBgBase};
`

const ImageWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 33%;
`

const StyledImage = styled.img`
  width: 100%;
  max-height: 10rem;
  object-fit: cover;
`

const CardContent = styled.div`
  height: fit-content;
  background-color: ${({theme}) => theme.cardBg};
  padding: .5rem;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  transition: background-color .3s ease-in-out;
`

const Text = styled(Link)`
  font-size: .75rem;
  color: ${({theme}) => theme.color};
  font-weight: 500;
  overflow: hidden;
   display: -webkit-box;
   -webkit-line-clamp: 1;
           line-clamp: 1;
   -webkit-box-orient: vertical;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: .5rem;
`

const CardImagemTexto = ({ video }) => {
  if (!video) return null
  return (
    <Card>
      <ImageWrapper>
        <StyledImage
          src={video.thumbnail}
          alt={video.content}
        />
      </ImageWrapper>
      <CardContent>
        <Text to={`/video/${video._id}`} title={video.content}>{video.content}</Text>
        <Actions>
          <Button variant="outline" size="icon" $rounded><LuThumbsUp size={16}/></Button>
          <Input type="text" placeholder="Escreva um comentário...">
            <Button variant="outline" size="icon" $rounded><LuMessageCircle size={16}/></Button>
          </Input>
          <Button variant="outline" size="icon" $rounded><LuShare2 size={16}/></Button>
        </Actions>
      </CardContent>
    </Card>
  )
}

export default CardImagemTexto
