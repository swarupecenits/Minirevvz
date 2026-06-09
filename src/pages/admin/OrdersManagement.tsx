import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, EyeOff, CheckCircle, Clock, Package, Truck, X as CloseIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { fetchAllOrders, updateOrderStatus, updatePaymentStatus, cancelOrder } from '../../lib/supabase';
import { Order, OrderStatus, PaymentStatus } from '../../lib/orderTypes';

const ORDER_STATUSES: OrderStatus[] = ['pending_payment', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'paid', 'failed', 'refunded'];

const STATUS_COLORS: Record<OrderStatus | PaymentStatus, string> = {
  pending_payment: 'warning',
  confirmed: 'success',
  packed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  unpaid: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'info'
};

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  pending_payment: <Clock className="w-4 h-4" />,
  confirmed: <CheckCircle className="w-4 h-4" />,
  packed: <Package className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle className="w-4 h-4" />,
  cancelled: <CloseIcon className="w-4 h-4" />
};

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState<OrderStatus | 'all'>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<PaymentStatus | 'all'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders when search or filters change
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.customerPhone.toLowerCase().includes(searchLower) ||
          order.productName.toLowerCase().includes(searchLower)
      );
    }

    // Order status filter
    if (filterOrderStatus !== 'all') {
      filtered = filtered.filter((order) => order.orderStatus === filterOrderStatus);
    }

    // Payment status filter
    if (filterPaymentStatus !== 'all') {
      filtered = filtered.filter((order) => order.paymentStatus === filterPaymentStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, search, filterOrderStatus, filterPaymentStatus]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await fetchAllOrders();
      if (fetchError) {
        setError('Failed to load orders. Please try again.');
        console.error('Fetch error:', fetchError);
        return;
      }
      setOrders(data || []);
    } catch (err) {
      setError('An error occurred while loading orders.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const { data, error } = await updateOrderStatus(orderId, newStatus);
      if (error) {
        setError('Failed to update order status.');
        return;
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
    } catch (err) {
      setError('An error occurred while updating order status.');
      console.error('Error:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: PaymentStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const { data, error } = await updatePaymentStatus(orderId, newStatus);
      if (error) {
        setError('Failed to update payment status.');
        return;
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, paymentStatus: newStatus }
            : order
        )
      );
    } catch (err) {
      setError('An error occurred while updating payment status.');
      console.error('Error:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      return;
    }

    setCancellingOrderId(orderId);
    try {
      const { error } = await cancelOrder(orderId);
      if (error) {
        setError('Failed to cancel order.');
        return;
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, orderStatus: 'cancelled' }
            : order
        )
      );
    } catch (err) {
      setError('An error occurred while cancelling order.');
      console.error('Error:', err);
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100 mb-2">
            Orders
          </h1>
          <p className="text-zinc-400">
            {orders.length} total orders
          </p>
        </div>
        <Button variant="secondary" onClick={loadOrders} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, phone, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Order Status
            </label>
            <select
              value={filterOrderStatus}
              onChange={(e) => setFilterOrderStatus(e.target.value as OrderStatus | 'all')}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="all">All Status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').charAt(0).toUpperCase() +
                    status.replace('_', ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Payment Status
            </label>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value as PaymentStatus | 'all')}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="all">All Payments</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 border border-white/10 rounded-xl">
          <p className="text-zinc-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="glass-panel rounded-xl border border-white/10 overflow-hidden"
            >
              {/* Summary Row */}
              <button
                onClick={() =>
                  setExpandedOrderId(
                    expandedOrderId === order.id ? null : order.id
                  )
                }
                className="w-full p-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      Order ID
                    </p>
                    <p className="text-zinc-100 font-mono text-sm truncate">
                      {order.id.slice(0, 8)}...
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      Customer
                    </p>
                    <p className="text-zinc-100 truncate">
                      {order.customerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      Product
                    </p>
                    <p className="text-zinc-100 truncate text-sm">
                      {order.productName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      Total
                    </p>
                    <p className="text-zinc-100 font-semibold">
                      ₹{order.totalPrice.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant={
                        STATUS_COLORS[order.orderStatus] as any
                      }
                      className="inline-flex items-center gap-2"
                    >
                      {STATUS_ICONS[order.orderStatus]}
                      <span className="capitalize">
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedOrderId === order.id && (
                <div className="border-t border-white/10 p-4 bg-white/5 space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-semibold text-zinc-100 mb-3">
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-500 mb-1">Name</p>
                        <p className="text-zinc-100">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 mb-1">Phone</p>
                        <p className="text-zinc-100">{order.customerPhone}</p>
                      </div>
                      {order.customerWhatsapp && (
                        <div>
                          <p className="text-zinc-500 mb-1">WhatsApp</p>
                          <p className="text-zinc-100">
                            {order.customerWhatsapp}
                          </p>
                        </div>
                      )}
                      {order.customerEmail && (
                        <div>
                          <p className="text-zinc-500 mb-1">Email</p>
                          <p className="text-zinc-100">{order.customerEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h4 className="font-semibold text-zinc-100 mb-3">
                      Delivery Address
                    </h4>
                    <p className="text-zinc-100 text-sm">
                      {order.address}
                      <br />
                      {order.city}, {order.state} - {order.pincode}
                      {order.landmark && (
                        <>
                          <br />
                          Near {order.landmark}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Order Details */}
                  <div>
                    <h4 className="font-semibold text-zinc-100 mb-3">
                      Order Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Product</span>
                        <span className="text-zinc-100">
                          {order.productName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Unit Price</span>
                        <span className="text-zinc-100">
                          ₹{order.productPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Quantity</span>
                        <span className="text-zinc-100">{order.quantity}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/10">
                        <span className="text-zinc-100 font-semibold">
                          Total Price
                        </span>
                        <span className="text-amber-400 font-bold">
                          ₹{order.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.customerNote && (
                    <div>
                      <h4 className="font-semibold text-zinc-100 mb-3">
                        Customer Note
                      </h4>
                      <p className="text-zinc-100 text-sm italic">
                        {order.customerNote}
                      </p>
                    </div>
                  )}

                  {/* Status Update Controls */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-100 mb-2">
                        Order Status
                      </label>
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleUpdateOrderStatus(
                            order.id,
                            e.target.value as OrderStatus
                          )
                        }
                        disabled={updatingOrderId === order.id}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ').charAt(0).toUpperCase() +
                              status.replace('_', ' ').slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-100 mb-2">
                        Payment Status
                      </label>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          handleUpdatePaymentStatus(
                            order.id,
                            e.target.value as PaymentStatus
                          )
                        }
                        disabled={updatingOrderId === order.id}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      >
                        {PAYMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {order.orderStatus !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="w-full text-red-400 border-red-500/20 hover:bg-red-500/10"
                      >
                        {cancellingOrderId === order.id
                          ? 'Cancelling...'
                          : 'Cancel Order'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
