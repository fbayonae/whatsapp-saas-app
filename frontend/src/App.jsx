import { useState } from 'react'

function App() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const handleSend = async () => {
    const res = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    })
    const data = await res.json()
    alert(JSON.stringify(data))
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Enviar mensaje WhatsApp</h2>
      <input placeholder="Número" onChange={e => setPhone(e.target.value)} />
      <br />
      <textarea placeholder="Mensaje" onChange={e => setMessage(e.target.value)} />
      <br />
      <button onClick={handleSend}>Enviar</button>
    </div>
  )
}

export default App
