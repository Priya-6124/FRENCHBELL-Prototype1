import crypto from 'crypto';
import getDb from '../db/index.js';

export class PaymentService {
  /**
   * Check if order already has an active or successful payment
   */
  static async getPaymentForOrder(orderId) {
    const db = await getDb();
    return await db.get('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1', [orderId]);
  }

  /**
   * Execute simulated test payment (success or failure)
   */
  static async executeSimulatedPayment({ orderNumber, outcome = 'success', method = 'simulated_upi' }) {
    const db = await getDb();

    // 1. Fetch order
    const order = await db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (!order) {
      throw new Error(`Order #${orderNumber} not found.`);
    }

    // Prevent duplicate payment on already paid order
    if (order.payment_status === 'successful' || order.payment_status === 'paid') {
      throw new Error(`Order #${orderNumber} has already been paid successfully.`);
    }

    const transactionId = `SIM_TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const amount = Number(order.total);

    // FAILURE SIMULATION
    if (outcome === 'failure') {
      await db.transaction(async (tx) => {
        // Record failed attempt
        await tx.run(`
          INSERT INTO payments (order_id, transaction_id, provider, amount, currency, method, status, error_message, raw_response)
          VALUES (?, ?, 'simulated', ?, 'INR', ?, 'failed', 'Simulated failure selected by customer/tester in test mode', ?)
        `, [
          order.id,
          transactionId,
          amount,
          method,
          JSON.stringify({ simulated: true, outcome: 'failure', timestamp: new Date().toISOString() })
        ]);

        // Update order status to failed
        await tx.run(`
          UPDATE orders
          SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [order.id]);

        // Record order status history
        await tx.run(`
          INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, change_reason)
          VALUES (?, ?, ?, 'Payment Service (Simulated)', 'Simulated payment failed')
        `, [order.id, order.order_status, order.order_status]);
      });

      return {
        success: false,
        status: 'failed',
        transaction_id: transactionId,
        order_number: order.order_number,
        message: 'Payment simulation failed. Your order remains pending and can be retried.'
      };
    }

    // SUCCESS SIMULATION
    const receiptNumber = `RCP_${order.order_number}`;

    await db.transaction(async (tx) => {
      // 1. Record payment
      await tx.run(`
        INSERT INTO payments (order_id, transaction_id, provider, amount, currency, method, status, raw_response)
        VALUES (?, ?, 'simulated', ?, 'INR', ?, 'successful', ?)
      `, [
        order.id,
        transactionId,
        amount,
        method,
        JSON.stringify({ simulated: true, outcome: 'success', timestamp: new Date().toISOString() })
      ]);

      // 2. Mark order as paid & received
      await tx.run(`
        UPDATE orders
        SET payment_status = 'successful', order_status = 'received', payment_method = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [method, order.id]);

      // 3. Decrement stock for all items
      const items = await tx.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      for (const item of items) {
        if (item.menu_item_id) {
          await tx.decrementStockForOrderItem(item.menu_item_id, item.quantity);
        }
      }

      // 4. Create receipt record
      const configuredPhone = process.env.RECEIPT_DISPATCH_PHONE_NUMBER || null;
      await tx.run(`
        INSERT INTO receipts (order_id, receipt_number, destination_phone, delivery_status, provider, delivery_message)
        VALUES (?, ?, ?, 'unconfigured', 'none', 'Receipt messaging is not configured. Digital receipt retained in account.')
        ON CONFLICT (receipt_number) DO UPDATE SET
          delivery_status = 'unconfigured',
          updated_at = CURRENT_TIMESTAMP
      `, [order.id, receiptNumber, configuredPhone]);

      // 5. Audit log
      await tx.run(`
        INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, change_reason)
        VALUES (?, ?, 'received', 'Payment Service (Simulated)', 'Simulated payment succeeded - Order confirmed')
      `, [order.id, order.order_status]);

      // 6. Admin notification
      await tx.addAdminNotification({
        title: `Order #${order.order_number} Paid & Confirmed`,
        message: `${order.customer_name} paid ₹${order.total} via ${method.toUpperCase()} (Simulated).`,
        type: 'order',
        linkTab: 'live-orders'
      });
    });

    return {
      success: true,
      status: 'successful',
      transaction_id: transactionId,
      order_number: order.order_number,
      receipt_number: receiptNumber,
      isSimulated: true,
      message: 'TEST / SIMULATED PAYMENT SUCCESSFUL. No real money was charged.'
    };
  }

  /**
   * Razorpay Test Mode Verification (Ready for future activation with RAZORPAY_KEY_SECRET)
   */
  static async verifyRazorpayPayment({ orderNumber, razorpayPaymentId, razorpayOrderId, razorpaySignature }) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('Razorpay is not configured on the server. Please use the simulated test payment provider.');
    }

    const db = await getDb();
    const order = await db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (!order) throw new Error(`Order #${orderNumber} not found.`);

    // Verify HMAC-SHA256 signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await db.run(`
        INSERT INTO payments (order_id, transaction_id, provider, amount, currency, method, status, error_message)
        VALUES (?, ?, 'razorpay', ?, 'INR', 'razorpay', 'failed', 'Invalid payment signature verification')
      `, [order.id, razorpayPaymentId || `FAIL_${Date.now()}`, order.total]);
      throw new Error('Payment signature verification failed. Untrusted payment submission.');
    }

    // Success transition
    const receiptNumber = `RCP_${order.order_number}`;
    await db.transaction(async (tx) => {
      await tx.run(`
        INSERT INTO payments (order_id, transaction_id, provider, amount, currency, method, status)
        VALUES (?, ?, 'razorpay', ?, 'INR', 'razorpay', 'successful')
      `, [order.id, razorpayPaymentId, order.total]);

      await tx.run(`
        UPDATE orders
        SET payment_status = 'successful', order_status = 'received', payment_method = 'razorpay', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [order.id]);

      const items = await tx.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      for (const item of items) {
        if (item.menu_item_id) {
          await tx.decrementStockForOrderItem(item.menu_item_id, item.quantity);
        }
      }

      await tx.run(`
        INSERT INTO receipts (order_id, receipt_number, destination_phone, delivery_status, provider, delivery_message)
        VALUES (?, ?, ?, 'unconfigured', 'none', 'Receipt messaging is not configured.')
        ON CONFLICT (receipt_number) DO NOTHING
      `, [order.id, receiptNumber, process.env.RECEIPT_DISPATCH_PHONE_NUMBER || null]);
    });

    return {
      success: true,
      status: 'successful',
      transaction_id: razorpayPaymentId,
      receipt_number: receiptNumber
    };
  }
}

/**
 * Receipt Delivery Provider Interface
 */
export class ReceiptDeliveryService {
  static getDestinationPhone() {
    const raw = process.env.RECEIPT_DISPATCH_PHONE_NUMBER || '';
    const digits = String(raw).replace(/\D/g, '');
    if (digits.length >= 10) return digits.slice(-10);
    return null;
  }

  static isMessagingConfigured() {
    // Neither WhatsApp nor SMS provider is activated for receipt dispatch in this phase
    return false;
  }

  static async dispatchReceipt(orderNumber) {
    const destination = this.getDestinationPhone();
    if (!this.isMessagingConfigured()) {
      return {
        sent: false,
        configured: false,
        destinationConfigured: !!destination,
        message: 'Receipt messaging is not configured. Digital receipt is retained in the customer account.'
      };
    }

    // Future messaging integration hook
    return {
      sent: false,
      configured: false,
      message: 'Receipt messaging is not configured.'
    };
  }
}

export default PaymentService;
