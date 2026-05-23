import Recorder from './components/Recorder'

export default function Home() {

  return (

    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-10 bg-black text-white">

      <h1 className="text-6xl font-bold">
        Voice Memo Tasks
      </h1>

      <Recorder />

    </main>
  )
}