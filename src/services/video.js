import api from "."

const createVideo = async (videoData) => {
  try {
    const response = await api.post("/videos", videoData)
    return response.data
  } catch (error) {
    console.error("Error creating video:", error.response?.data || error.message)
    throw error
  }
}

const getPopularVideos = async () => {
  try {
    const response = await api.get("/videos/popular")
    return response.data
  } catch (error) {
    console.error("Error fetching popular videos:", error.response?.data || error.message)
    throw error
  }
}

const getRecentVideos = async () => {
  try {
    const response = await api.get("/videos/recents")
    return response.data
  } catch (error) {
    console.error("Error fetching recent videos:", error.response?.data || error.message)
    throw error
  }
}

const getVideosByUser = async (userId) => {
  try {
    const response = await api.get(`/videos/${userId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching videos for user ${userId}:`, error.response?.data || error.message)
    throw error
  }
}

const getVideoById = async (videoId) => {
  try {
    const response = await api.get(`/videos/one/${videoId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching video ${videoId}:`, error.response?.data || error.message)
    throw error
  }
}

const deleteVideoById = async (videoId) => {
  try {
    await api.delete(`/videos/${videoId}`)
  } catch (error) {
    console.error(`Error deleting video ${videoId}:`, error.response?.data || error.message)
    throw error
  }
}

const likeVideo = async (videoId) => {
  try {
    await api.post(`/likes/${videoId}`)
  } catch (error) {
    console.error(`Error liking video ${videoId}:`, error.response?.data || error.message)
    throw error
  }
}

const unlikeVideo = async (videoId) => {
  try {
    await api.delete(`/likes/${videoId}`)
  } catch (error) {
    console.error(`Error unliking video ${videoId}:`, error.response?.data || error.message)
    throw error
  }
}

const getVideoLikes = async (videoId) => {
  try {
    const response = await api.get(`/likes/${videoId}`)
    return response.data
  } catch (error) {
    console.error(`Error getting likes for video ${videoId}:`, error.response?.data || error.message)
    throw error
  }
}

const getCommentsForVideo = async (videoId) => {
  try {
    const response = await api.get(`/comments/list/${videoId}`)
    return response.data
  } catch (error) {
    console.warn(`Warning: Endpoint GET /comments/video/${videoId} might not exist or failed.`, error.response?.data || error.message)
    return []
  }
}


const addComment = async (videoId, content) => {
  try {
    const response = await api.post(`/comments/${videoId}`, { content })
    return response.data
  } catch (error) {
    console.error(`Error adding comment to video ${videoId}:`, error.response?.data || error.message)
    throw error
  }
}

const deleteComment = async (videoId, commentId) => {
  try {
    await api.delete(`/comments/${videoId}/${commentId}`)
  } catch (error) {
    console.error(`Error deleting comment ${commentId} from video ${videoId}:`, error.response?.data || error.message)
    throw error
  }
}

const getVideoCommentCount = async (videoId) => {
  try {
    const response = await api.get(`/comments/${videoId}`)
    return response.data
  } catch (error) {
    console.error(`Error getting comment count for video ${videoId}:`, error.response?.data || error.message)
    throw error
  }
}

const replyToComment = async (commentId, content) => {
  try {
    const response = await api.post(`/replys/${commentId}`, { content })
    return response.data
  } catch (error) {
    console.error(`Error replying to comment ${commentId}:`, error.response?.data || error.message)
    throw error
  }
}

const getRepliesForComment = async (commentId) => {
  try {
    const response = await api.get(`/replys/${commentId}`)
    return response.data
  } catch (error) {
    console.error(`Error getting replies for comment ${commentId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const shareVideo = async (videoId) => {
  try {
    await api.post(`/shares/${videoId}`)
  } catch (error) {
    console.error(`Error sharing video ${videoId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getVideoShares = async (videoId) => {
  try {
    const response = await api.get(`/shares/${videoId}`)
    return response.data
  } catch (error) {
    console.error(`Error getting shares for video ${videoId}:`, error.response?.data?.error?.message || error.message)
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
  getCommentsForVideo,
  addComment,
  deleteComment,
  getVideoCommentCount,
  replyToComment,
  getRepliesForComment,
  shareVideo,
  getVideoShares
}
