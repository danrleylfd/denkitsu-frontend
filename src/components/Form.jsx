const Form = ({ title, children, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) onSubmit(e)
  }
  return (
    <div
      className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 text-center opacity-75 shadow-lg sm:p-12 dark:border-gray-700 dark:bg-zinc-900 dark:opacity-90">
      <h2 className="pb-4 text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {children}
      </form>
    </div>
  )
}

export default Form
