import SideMenu from "../components/SideMenu"
import KanbanBoard from "../components/Kanban/Board"

const ContentView = ({ children }) => (
  <main
    className="flex flex-col items-center px-2 gap-2 mx-auto w-full min-h-screen xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[85%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const Kanban = () => {
  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <KanbanBoard />
    </SideMenu>
  )
}

export default Kanban
