import api from "./"

const getUserAccount = async (userId = null) => {
  const endpoint = userId ? `/account/${userId}` : "/account"
  try {
    const response = await api.get(endpoint)
    return response.data.user
  } catch (error) {
    console.error(`Error on getUserAccount ${userId || "self"}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const editUserAccount = async (userData) => {
  try {
    const response = await api.put("/account", userData)
    return response.data.user
  } catch (error) {
    console.error("Error on editUserAccount:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const deleteUserAccount = async () => {
  try {
    await api.delete("/account")
  } catch (error) {
    console.error("Error on deleteUserAccount:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const unlinkGithubAccount = async () => {
  try {
    const response = await api.delete("/account/github/unlink")
    return response.data.user
  } catch (error) {
    console.error("Error on unlinkGithubAccount:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

export { getUserAccount, editUserAccount, deleteUserAccount, unlinkGithubAccount }
