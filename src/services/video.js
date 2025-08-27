import api from "."

const createVideo = async (videoData) => {
  try {
    const response = await api.post("/videos", videoData)
    return response.data
  } catch (error) {
    console.error("Error on createVideo:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getPopularVideos = async () => {
  try {
    const response = await api.get("/videos/popular")
    return response.data
  } catch (error) {
    console.error("Error on getPopularVideos:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getRecentVideos = async () => {
  try {
    const response = await api.get("/videos/recents")
    return response.data
  } catch (error) {
    console.error("Error on getRecentVideos:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getVideosByUser = async (userId) => {
  try {
    const response = await api.get(`/videos/${userId}`)
    return response.data
  } catch (error) {
    console.error(`Error on getVideosByUser ${userId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getVideoById = async (videoId) => {
  try {
    const response = await api.get(`/videos/one/${videoId}`)
    return response.data
  } catch (error) {
    console.error(`Error on getVideoById ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const deleteVideoById = async (videoId) => {
  try {
    await api.delete(`/videos/${videoId}`)
  } catch (error) {
    console.error(`Error on deleteVideoById ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const likeVideo = async (videoId) => {
  try {
    await api.post(`/likes/${videoId}`)
  } catch (error) {
    console.error(`Error on likeVideo ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const unlikeVideo = async (videoId) => {
  try {
    await api.delete(`/likes/${videoId}`)
  } catch (error) {
    console.error(`Error on unlikeVideo ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getVideoLikes = async (videoId) => {
  try {
    const response = await api.get(`/likes/${videoId}`)
    return response.data
  } catch (error) {
    console.error(`Error on getVideoLikes for video ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getLikeStatus = async (videoId) => {
  try {
    const response = await api.get(`/likes/${videoId}/status`)
    return response.data
  } catch (error) {
    console.error(`Error on getLikeStatus for video ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getCommentsForVideo = async (videoId) => {
  try {
    const response = await api.get(`/comments/list/${videoId}`)
    return response.data
  } catch (error) {
    console.error(`Error on getCommentsForVideo videoID ${videoId}:`, error.response?.data?.error?.message || error.message)
    return []
  }
}

const addComment = async (videoId, content) => {
  try {
    const response = await api.post(`/comments/${videoId}`, { content })
    return response.data
  } catch (error) {
    console.error(`Error on addComment videoID ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const deleteComment = async (videoId, commentId) => {
  try {
    await api.delete(`/comments/${videoId}/${commentId}`)
  } catch (error) {
    console.error(`Error on deleteComment commentID ${commentId} from videoID ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getVideoCommentCount = async (videoId) => {
  try {
    const response = await api.get(`/comments/${videoId}`)
    return response.data
  } catch (error) {
    console.error(`Error on getVideoCommentCount for videoID ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const replyToComment = async (commentId, content) => {
  try {
    const response = await api.post(`/replys/${commentId}`, { content })
    return response.data
  } catch (error) {
    console.error(`Error on replyToComment commentID ${commentId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getRepliesForComment = async (commentId) => {
  try {
    const response = await api.get(`/replys/${commentId}`)
    return response.data
  } catch (error) {
    console.error(`Error on getRepliesForComment commentID ${commentId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const shareVideo = async (videoId) => {
  try {
    await api.post(`/shares/${videoId}`)
  } catch (error) {
    console.error(`Error on shareVideo videoID ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getVideoShares = async (videoId) => {
  try {
    const response = await api.get(`/shares/${videoId}`)
    return response.data
  } catch (error) {
    console.error(`Error on getVideoShares videoID ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

export {
  createVideo,
  getPopularVideos,
  getRecentVideos,
  getVideosByUser,
  getVideoById,
  deleteVideoById,
  likeVideo,
  unlikeVideo,
  getVideoLikes,
  getLikeStatus,
  getCommentsForVideo,
  addComment,
  deleteComment,
  getVideoCommentCount,
  replyToComment,
  getRepliesForComment,
  shareVideo,
  getVideoShares
}
