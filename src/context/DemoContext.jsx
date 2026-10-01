import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const DemoContext = createContext(null)

const seed = {
  surplus: { id: 'FW-2026-031', food: 'Cooked Rice', category: 'Grains', quantity: 35, unit: 'kg', provider: 'GreenLeaf Hotel', location: 'Koramangala, Bengaluru', deadline: '7:30 PM', preparation: 'Today, 4:15 PM', status: 'Surplus Listed', ngo: 'Hope Foundation', distance: '3.2 km', match: 94 },
  notifications: [
    { id: 1, title: 'AI detected an unusual waste pattern.', time: '12 min ago', type: 'insight', read: false },
    { id: 2, title: 'Storage conditions are within safe limits.', time: '38 min ago', type: 'system', read: false },
  ],
  metrics: { saved: 12860, redistributed: 8620, prevented: 9240, meals: 21450, events: 146 },
  activity: [],
}

const cloneSeed = () => JSON.parse(JSON.stringify(seed))

export function DemoProvider({ children }) {
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem('foodwise-demo')
    return stored ? JSON.parse(stored) : cloneSeed()
  })

  useEffect(() => localStorage.setItem('foodwise-demo', JSON.stringify(data)), [data])

  const pushNotification = (title, type = 'success') => setData(prev => ({ ...prev, notifications: [{ id: Date.now(), title, time: 'Just now', type, read: false }, ...prev.notifications] }))

  const publishSurplus = (form = {}) => {
    setData(prev => ({ ...prev, surplus: { ...prev.surplus, ...form, status: 'Surplus Listed' }, activity: [{ id: Date.now(), label: 'New surplus listed', detail: `${form.quantity || prev.surplus.quantity} kg ${form.food || prev.surplus.food}`, time: 'Just now' }, ...prev.activity] }))
    pushNotification('54 kg surplus successfully listed for redistribution.')
  }

  const requestDonation = () => {
    setData(prev => ({ ...prev, surplus: { ...prev.surplus, status: 'NGO Matched' }, activity: [{ id: Date.now(), label: 'Hope Foundation requested a donation', detail: `${prev.surplus.quantity} kg ${prev.surplus.food}`, time: 'Just now' }, ...prev.activity] }))
    pushNotification('Hope Foundation requested 35 kg of food.')
  }

  const advance = nextStatus => {
    setData(prev => {
      const updates = { surplus: { ...prev.surplus, status: nextStatus }, activity: [{ id: Date.now(), label: `Donation ${nextStatus.toLowerCase()}`, detail: prev.surplus.id, time: 'Just now' }, ...prev.activity] }
      if (nextStatus === 'Delivered') updates.metrics = { ...prev.metrics, redistributed: prev.metrics.redistributed + prev.surplus.quantity, meals: prev.metrics.meals + 70, events: prev.metrics.events + 1 }
      return { ...prev, ...updates }
    })
    const messages = { 'Donation Accepted': 'Donation accepted by GreenLeaf Hotel.', 'Pickup Assigned': 'Donation pickup has been assigned.', 'In Transit': 'Donation is now in transit.', Delivered: 'Delivery successfully completed.' }
    pushNotification(messages[nextStatus] || `Status updated to ${nextStatus}.`)
  }

  const reset = () => setData(prev => ({ ...cloneSeed(), notifications: [{ id: Date.now(), title: 'Demo data has been reset.', time: 'Just now', type: 'success', read: false }, ...cloneSeed().notifications] }))
  const simulate = type => {
    if (type === 'surplus') publishSurplus({ food: 'Vegetable Curry', quantity: 24, category: 'Prepared Meals' })
    if (type === 'request') requestDonation()
    if (type === 'pickup') advance('Pickup Assigned')
    if (type === 'delivery') advance('Delivered')
    if (type === 'insight') pushNotification('New AI insight: Saturday dinner has elevated surplus risk.', 'insight')
  }

  const value = useMemo(() => ({ data, publishSurplus, requestDonation, advance, pushNotification, reset, simulate }), [data])
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export const useDemo = () => useContext(DemoContext)
