import KanbanBoard from "../components/KanbanBoard"
import SideMenu from "../components/SideMenu"

const ContentView = ({ children }) => <main className="flex flex-col items-center p-2 gap-2 mx-auto min-h-screen w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">{children}</main>

const Kanban = () => {
  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <KanbanBoard />
    </SideMenu>
  )
}

export default Kanban
