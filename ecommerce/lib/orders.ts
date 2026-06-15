export interface OrderItem {
  serviceId: string
  serviceName: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'
  createdAt: string
}

let orders: Order[] = []

export function getAllOrders(): Order[] {
  return orders
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id)
}

export function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const newOrder: Order = {
    ...order,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  }
  orders = [...orders, newOrder]
  return newOrder
}
